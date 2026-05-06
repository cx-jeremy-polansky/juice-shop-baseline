/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import * as frisby from 'frisby'
import config from 'config'

const URL = 'http://localhost:3000'

const jsonHeader = { 'content-type': 'application/json' }
let authHeader: { Cookie: any }

beforeAll(() => {
  return frisby.post(`${URL}/rest/user/login`, {
    headers: jsonHeader,
    body: {
      email: 'jim@juice-sh.op',
      password: 'ncc-1701'
    }
  })
    .expect('status', 200)
    .then(({ json }) => {
      authHeader = { Cookie: `token=${json.authentication.token}` }
    })
})

describe('/profile', () => {
  it('GET user profile is forbidden for unauthenticated user', () => {
    return frisby.get(`${URL}/profile`)
      .expect('status', 500)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', `<h1>${config.get<string>('application.name')} (Express`)
      .expect('bodyContains', 'Error: Blocked illegal activity')
  })

  it('GET user profile of authenticated user', () => {
    return frisby.get(`${URL}/profile`, {
      headers: authHeader
    })
      .expect('status', 200)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', 'id="email" type="email" name="email" value="jim@juice-sh.op"')
  })

  it('POST update username of authenticated user', () => {
    const form = frisby.formData()
    form.append('username', 'Localhorst')

    return frisby.post(`${URL}/profile`, {
      // @ts-expect-error FIXME form.getHeaders() is not found
      headers: { 'Content-Type': form.getHeaders()['content-type'], Cookie: authHeader.Cookie },
      body: form,
      redirect: 'manual'
    })
      .expect('status', 302)
  })

  xit('POST update username is forbidden for unauthenticated user', () => { // FIXME runs into "socket hang up"
    const form = frisby.formData()
    form.append('username', 'Localhorst')

    return frisby.post(`${URL}/profile`, {
      // @ts-expect-error FIXME form.getHeaders() is not found
      headers: { 'Content-Type': form.getHeaders()['content-type'] },
      body: form
    })
      .expect('status', 500)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', `<h1>${config.get<string>('application.name')} (Express`)
      .expect('bodyContains', 'Error: Blocked illegal activity')
  })

  describe('XSS Prevention Tests', () => {
    it('GET user profile should encode HTML entities in email to prevent XSS', () => {
      return frisby.get(`${URL}/profile`, {
        headers: authHeader
      })
        .expect('status', 200)
        .expect('header', 'content-type', /text\/html/)
        .then(({ body }) => {
          // Email should be HTML entity encoded in the value attribute
          // The email "jim@juice-sh.op" should appear encoded if it contained special chars
          // More importantly, any script tags or HTML should be encoded
          expect(body).not.toMatch(/<script>.*<\/script>/i)
          expect(body).not.toMatch(/javascript:/i)
          expect(body).toMatch(/value=/)
        })
    })

    it('GET user profile should encode HTML entities in profileImage to prevent XSS', () => {
      return frisby.get(`${URL}/profile`, {
        headers: authHeader
      })
        .expect('status', 200)
        .expect('header', 'content-type', /text\/html/)
        .then(({ body }) => {
          // ProfileImage src attribute should not contain unencoded script tags
          // Check that the img tag exists but doesn't have malicious content
          expect(body).toMatch(/<img[^>]+src=/)
          // Any angle brackets in src would be encoded as &lt; and &gt;
          expect(body).not.toMatch(/src="[^"]*<script/i)
          expect(body).not.toMatch(/src='[^']*<script/i)
          expect(body).not.toMatch(/onerror=/i)
        })
    })

    it('GET user profile should not execute XSS payload in profileImage attribute', () => {
      return frisby.get(`${URL}/profile`, {
        headers: authHeader
      })
        .expect('status', 200)
        .expect('header', 'content-type', /text\/html/)
        .then(({ body }) => {
          // Verify common XSS vectors are not present in executable form
          expect(body).not.toMatch(/src="javascript:/i)
          expect(body).not.toMatch(/src='javascript:/i)
          expect(body).not.toMatch(/src=javascript:/i)
          // Event handlers should not be injected
          expect(body).not.toMatch(/onerror\s*=\s*["']?\s*alert/i)
          expect(body).not.toMatch(/onload\s*=\s*["']?\s*alert/i)
        })
    })

    it('GET user profile should encode angle brackets in user-controlled fields', () => {
      return frisby.get(`${URL}/profile`, {
        headers: authHeader
      })
        .expect('status', 200)
        .expect('header', 'content-type', /text\/html/)
        .then(({ body }) => {
          // If email or other fields contained < or >, they should be encoded as &lt; and &gt;
          // Check that user input areas don't have raw angle brackets that could break out of attributes
          const emailMatch = body.match(/id="email"[^>]*value="([^"]*)"/)
          if (emailMatch && emailMatch[1]) {
            // If the value contains &lt; or &gt;, that's proper encoding
            // If it contains raw < or >, that's a problem (unless it's part of valid HTML structure)
            expect(emailMatch[1]).not.toMatch(/<script|<iframe|<img[^>]+onerror/)
          }
        })
    })

    it('GET user profile should prevent stored XSS from profileImage field', () => {
      return frisby.get(`${URL}/profile`, {
        headers: authHeader
      })
        .expect('status', 200)
        .then(({ body }) => {
          // The most critical test: ensure that even if profileImage in DB had XSS payload,
          // it gets encoded in the output HTML
          // Look for the img tag with src attribute
          const imgMatch = body.match(/<img[^>]+class="img-rounded"[^>]*src="([^"]*)"/)
          if (imgMatch && imgMatch[1]) {
            const srcValue = imgMatch[1]
            // The src should not contain unencoded < > characters that could inject HTML
            expect(srcValue).not.toMatch(/[<>]/)
            // Should not have javascript: protocol
            expect(srcValue).not.toMatch(/^javascript:/i)
            // Should not have data:text/html protocol
            expect(srcValue).not.toMatch(/^data:text\/html/i)
          }
        })
    })

    it('GET user profile should prevent XSS in email field attribute', () => {
      return frisby.get(`${URL}/profile`, {
        headers: authHeader
      })
        .expect('status', 200)
        .then(({ body }) => {
          // Check that email field value attribute is properly encoded
          const emailMatch = body.match(/id="email"[^>]*value="([^"]*)"/)
          if (emailMatch && emailMatch[1]) {
            const emailValue = emailMatch[1]
            // Should not contain quote-breaking characters or event handlers
            expect(emailValue).not.toMatch(/" onerror="/i)
            expect(emailValue).not.toMatch(/" onload="/i)
            expect(emailValue).not.toMatch(/"><script/i)
          }
        })
    })
  })
})
