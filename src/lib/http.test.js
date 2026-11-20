import { AUTH_EXPIRED_EVENT, TOKEN_KEY, errorMessage, http, unwrap } from './http'

const adapterReturning = (status, data) => (config) =>
  status >= 400
    ? Promise.reject(Object.assign(new Error('x'), { config, response: { status, data } }))
    : Promise.resolve({ status, data, headers: {}, config })

describe('http client', () => {
  it('memakai baseURL /api', () => {
    expect(http.defaults.baseURL).toBe('/api')
  })

  it('menyisipkan Bearer token bila tersedia', async () => {
    localStorage.setItem(TOKEN_KEY, 'abc')
    let seen
    await http.get('/x', { adapter: (c) => { seen = c; return Promise.resolve({ data: {}, status: 200, headers: {}, config: c }) } })
    expect(seen.headers.Authorization).toBe('Bearer abc')
  })

  it('tidak menyisipkan header tanpa token', async () => {
    let seen
    await http.get('/x', { adapter: (c) => { seen = c; return Promise.resolve({ data: {}, status: 200, headers: {}, config: c }) } })
    expect(seen.headers.Authorization).toBeUndefined()
  })

  it('memicu event kedaluwarsa pada 401 jika token ada', async () => {
    const handler = vi.fn()
    window.addEventListener(AUTH_EXPIRED_EVENT, handler)
    localStorage.setItem(TOKEN_KEY, 'abc')
    await expect(http.get('/x', { adapter: adapterReturning(401, {}) })).rejects.toBeTruthy()
    expect(handler).toHaveBeenCalledTimes(1)
    window.removeEventListener(AUTH_EXPIRED_EVENT, handler)
  })

  it('tidak memicu event pada 401 tanpa token (mis. login salah) maupun status lain', async () => {
    const handler = vi.fn()
    window.addEventListener(AUTH_EXPIRED_EVENT, handler)
    await expect(http.get('/x', { adapter: adapterReturning(401, {}) })).rejects.toBeTruthy()
    localStorage.setItem(TOKEN_KEY, 'abc')
    await expect(http.get('/x', { adapter: adapterReturning(500, {}) })).rejects.toBeTruthy()
    await expect(http.get('/x', { adapter: () => Promise.reject(new Error('network')) })).rejects.toThrow('network')
    expect(handler).not.toHaveBeenCalled()
    window.removeEventListener(AUTH_EXPIRED_EVENT, handler)
  })

  it('unwrap mengambil data.data', () => {
    expect(unwrap({ data: { data: [1] } })).toEqual([1])
  })

  it('errorMessage memakai pesan server atau fallback', () => {
    expect(errorMessage({ response: { data: { message: 'Pesan server' } } })).toBe('Pesan server')
    expect(errorMessage(new Error('x'))).toBe('Terjadi kesalahan, coba lagi.')
    expect(errorMessage(new Error('x'), 'Cadangan')).toBe('Cadangan')
  })
})
