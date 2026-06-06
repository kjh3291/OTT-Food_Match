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

describe('t', () => {
  afterEach(() => localStorage.clear());
  test('현재 언어에 맞는 번역을 반환', () => {
    localStorage.setItem('lang', 'en');
    expect(t('tab_action')).toBe('Action');
    localStorage.setItem('lang', 'ja');
    expect(t('tab_action')).toBe('アクション');
  });
  test('없는 키는 키 자체를 반환(폴백)', () => {
    expect(t('존재하지않는키')).toBe('존재하지않는키');
  });
});
