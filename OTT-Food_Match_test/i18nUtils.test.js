const { getLang, t } = require('./i18n-utils');

describe('getLang', () => {
  afterEach(() => localStorage.clear());
  test('기본값은 ko', () => {
    expect(getLang()).toBe('ko');
  });
  test('저장된 언어를 읽는다', () => {
    localStorage.setItem('lang', 'en');
    expect(getLang()).toBe('en');
  });
});


