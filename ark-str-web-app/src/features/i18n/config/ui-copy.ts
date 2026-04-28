import type { ReaderLocale } from "@/features/content/types";

type HomeCopy = {
  namePrompt: string;
  namePlaceholder: string;
  continueReading: string;
  openArchive: string;
  serviceTitle: string;
  serviceIntro: string;
  recommendationEyebrow: string;
  statsTitle: string;
  groups: string;
  stories: string;
  chars: string;
  minutes: string;
  trails: string;
  missing: string;
  generatedAt: string;
  footer: string;
  collections: Record<string, string>;
};

export type UiCopy = {
  appBar: {
    home: string;
    notes: string;
    search: string;
    story: string;
    themeDark: string;
    themeLight: string;
  };
  archive: {
    generated: string;
    localeArchive: string;
    references: string;
    storylines: string;
    storyline: string;
  };
  common: {
    aboutMinutes: (value: string) => string;
    chars: string;
    groups: string;
    loading: string;
    stories: string;
  };
  group: {
    missing: string;
  };
  home: HomeCopy;
  notes: {
    editNote: (storyTitle: string) => string;
    empty: string;
    goToStory: string;
    loading: string;
    title: string;
  };
  search: {
    empty: string;
    indexError: string;
    indexLoading: (localeLabel: string) => string;
    label: string;
    loadingMore: string;
    noResults: string;
    placeholder: (localeLabel: string) => string;
    resultStories: (value: string) => string;
    title: string;
  };
  status: {
    assetManifestError: (message: string) => string;
    contentIndexError: (message: string) => string;
    contentIndexLoading: string;
    storyBodyError: (message: string) => string;
    storyBodyLoading: string;
    storyBodyUnavailable: string;
    storyGroupMissing: string;
    storyMissing: string;
  };
  storyNavigation: {
    label: string;
    next: string;
    nextAria: (storyTitle: string) => string;
    previous: string;
    previousAria: (storyTitle: string) => string;
  };
  storyNote: {
    close: string;
    label: string;
    open: string;
    placeholder: string;
  };
};

export const UI_INTL_LOCALES = {
  cn: "zh-CN",
  en: "en-US",
  jp: "ja-JP",
  kr: "ko-KR",
  tw: "zh-TW",
} satisfies Record<ReaderLocale, string>;

export const UI_DOCUMENT_LANG = {
  cn: "zh-CN",
  en: "en",
  jp: "ja",
  kr: "ko",
  tw: "zh-TW",
} satisfies Record<ReaderLocale, string>;

const footer = "Maintainer - dev.Woong · 명생명사";

const UI_COPY = {
  cn: {
    appBar: {
      home: "首页",
      notes: "查看笔记",
      search: "搜索",
      story: "故事",
      themeDark: "切换到深色主题",
      themeLight: "切换到浅色主题",
    },
    archive: {
      generated: "已生成",
      localeArchive: "语言档案",
      references: "引用",
      storylines: "故事线",
      storyline: "故事线",
    },
    common: {
      aboutMinutes: (value) => `约 ${value} 分钟`,
      chars: "字",
      groups: "组",
      loading: "加载中",
      stories: "故事",
    },
    group: {
      missing: "找不到请求的故事组。",
    },
    home: {
      namePrompt: "你的名字是？",
      namePlaceholder: "博士代号",
      continueReading: "继续阅读",
      openArchive: "打开故事库",
      serviceTitle: "ARK STR",
      serviceIntro:
        "一个本地优先的明日方舟叙事档案，按故事线、章节与人物痕迹重新整理泰拉的长篇文本。",
      recommendationEyebrow: "推荐阅读",
      statsTitle: "收录统计",
      groups: "组",
      stories: "故事",
      chars: "字",
      minutes: "分钟",
      trails: "条线索",
      missing: "未收录",
      generatedAt: "内容快照",
      footer,
      collections: {
        terra_notes: "管理员的泰拉笔记",
        ancient_archive: "旧人类档案",
        explore_behemoth: "探索：巨兽",
        explore_beast_lords: "探索：兽主",
      },
    },
    notes: {
      editNote: (storyTitle) => `编辑 ${storyTitle} 的笔记`,
      empty: "还没有写下任何笔记。",
      goToStory: "打开故事",
      loading: "正在加载笔记",
      title: "笔记",
    },
    search: {
      empty: "输入搜索词后，将在当前语言的所有故事中查找。",
      indexError: "无法加载搜索索引。",
      indexLoading: (localeLabel) => `正在加载 ${localeLabel} 搜索索引`,
      label: "故事搜索",
      loadingMore: "正在加载更多搜索结果",
      noResults: "没有匹配的故事。",
      placeholder: (localeLabel) => `搜索 ${localeLabel} 故事`,
      resultStories: (value) => `${value} 个故事`,
      title: "搜索",
    },
    status: {
      assetManifestError: (message) => `无法加载生成的资源清单：${message}`,
      contentIndexError: (message) => `无法加载生成的内容索引：${message}`,
      contentIndexLoading: "正在加载生成的内容索引",
      storyBodyError: (message) => `无法加载生成的故事正文：${message}`,
      storyBodyLoading: "正在加载故事正文",
      storyBodyUnavailable:
        "这个故事的生成正文 JSON 尚未准备好。它已登记在 source manifest 中，但正文文件为空或仍未解析。",
      storyGroupMissing: "找不到请求的故事组。",
      storyMissing: "找不到请求的故事。",
    },
    storyNavigation: {
      label: "故事导航",
      next: "下一篇 ›",
      nextAria: (storyTitle) => `下一篇故事：${storyTitle}`,
      previous: "‹ 上一篇",
      previousAria: (storyTitle) => `上一篇故事：${storyTitle}`,
    },
    storyNote: {
      close: "关闭故事笔记",
      label: "故事笔记",
      open: "打开故事笔记",
      placeholder: "为这个故事留下笔记",
    },
  },
  en: {
    appBar: {
      home: "Home",
      notes: "View notes",
      search: "Search",
      story: "Story",
      themeDark: "Switch to dark theme",
      themeLight: "Switch to light theme",
    },
    archive: {
      generated: "Generated",
      localeArchive: "Locale archive",
      references: "references",
      storylines: "Storylines",
      storyline: "Storyline",
    },
    common: {
      aboutMinutes: (value) => `about ${value} min`,
      chars: "chars",
      groups: "groups",
      loading: "Loading",
      stories: "stories",
    },
    group: {
      missing: "The requested story group could not be found.",
    },
    home: {
      namePrompt: "What is your name?",
      namePlaceholder: "Doctor codename",
      continueReading: "Continue reading",
      openArchive: "Open archive",
      serviceTitle: "ARK STR",
      serviceIntro:
        "A local-first Arknights narrative archive that reorganizes Terra's long-form stories by storyline, chapter, and character traces.",
      recommendationEyebrow: "Recommended reads",
      statsTitle: "Archive stats",
      groups: "groups",
      stories: "stories",
      chars: "chars",
      minutes: "min",
      trails: "trails",
      missing: "Unavailable",
      generatedAt: "Content snapshot",
      footer,
      collections: {
        terra_notes: "Administrator's Terra Notes",
        ancient_archive: "Old Humanity Archive",
        explore_behemoth: "Explore: Behemoths",
        explore_beast_lords: "Explore: Beast Lords",
      },
    },
    notes: {
      editNote: (storyTitle) => `Edit note for ${storyTitle}`,
      empty: "No notes yet.",
      goToStory: "Open story",
      loading: "Loading notes",
      title: "Notes",
    },
    search: {
      empty: "Enter a search term to search every story in the current language.",
      indexError: "The search index could not be loaded.",
      indexLoading: (localeLabel) => `Loading ${localeLabel} search index`,
      label: "Story search",
      loadingMore: "Loading more search results",
      noResults: "No matching stories.",
      placeholder: (localeLabel) => `Search ${localeLabel} stories`,
      resultStories: (value) => `${value} stories`,
      title: "Search",
    },
    status: {
      assetManifestError: (message) => `Generated asset manifest could not be loaded: ${message}`,
      contentIndexError: (message) => `Generated content index could not be loaded: ${message}`,
      contentIndexLoading: "Loading generated content index",
      storyBodyError: (message) => `Generated story body could not be loaded: ${message}`,
      storyBodyLoading: "Loading story body",
      storyBodyUnavailable:
        "The generated body JSON for this story is not ready yet. It is registered in the source manifest, but the body file is empty or unresolved.",
      storyGroupMissing: "The requested story group could not be found.",
      storyMissing: "The requested story could not be found.",
    },
    storyNavigation: {
      label: "Story navigation",
      next: "Next ›",
      nextAria: (storyTitle) => `Next story: ${storyTitle}`,
      previous: "‹ Previous",
      previousAria: (storyTitle) => `Previous story: ${storyTitle}`,
    },
    storyNote: {
      close: "Close story note",
      label: "Story note",
      open: "Open story note",
      placeholder: "Note for this story",
    },
  },
  jp: {
    appBar: {
      home: "ホーム",
      notes: "メモ一覧",
      search: "検索",
      story: "ストーリー",
      themeDark: "ダークテーマに切り替え",
      themeLight: "ライトテーマに切り替え",
    },
    archive: {
      generated: "生成済み",
      localeArchive: "ロケールアーカイブ",
      references: "参照",
      storylines: "ストーリーライン",
      storyline: "ストーリーライン",
    },
    common: {
      aboutMinutes: (value) => `約${value}分`,
      chars: "文字",
      groups: "グループ",
      loading: "読み込み中",
      stories: "ストーリー",
    },
    group: {
      missing: "指定されたストーリーグループが見つかりません。",
    },
    home: {
      namePrompt: "あなたの名前は？",
      namePlaceholder: "ドクター名",
      continueReading: "続きを読む",
      openArchive: "アーカイブを開く",
      serviceTitle: "ARK STR",
      serviceIntro:
        "アークナイツの膨大な物語を、ストーリーライン、章、人物の痕跡から読み直すローカルファーストのアーカイブです。",
      recommendationEyebrow: "おすすめ",
      statsTitle: "収録統計",
      groups: "グループ",
      stories: "ストーリー",
      chars: "文字",
      minutes: "分",
      trails: "ルート",
      missing: "未収録",
      generatedAt: "コンテンツスナップショット",
      footer,
      collections: {
        terra_notes: "管理者のテラノート",
        ancient_archive: "旧人類アーカイブ",
        explore_behemoth: "探索：ベヒモス",
        explore_beast_lords: "探索：獣主",
      },
    },
    notes: {
      editNote: (storyTitle) => `${storyTitle}のメモを編集`,
      empty: "まだメモはありません。",
      goToStory: "ストーリーを開く",
      loading: "メモを読み込み中",
      title: "メモ",
    },
    search: {
      empty: "検索語を入力すると、現在の言語の全ストーリーから探します。",
      indexError: "検索インデックスを読み込めませんでした。",
      indexLoading: (localeLabel) => `${localeLabel}の検索インデックスを読み込み中`,
      label: "ストーリー検索",
      loadingMore: "検索結果をさらに読み込み中",
      noResults: "一致するストーリーはありません。",
      placeholder: (localeLabel) => `${localeLabel}ストーリーを検索`,
      resultStories: (value) => `${value}件のストーリー`,
      title: "検索",
    },
    status: {
      assetManifestError: (message) => `生成済みアセットマニフェストを読み込めませんでした: ${message}`,
      contentIndexError: (message) => `生成済みコンテンツインデックスを読み込めませんでした: ${message}`,
      contentIndexLoading: "生成済みコンテンツインデックスを読み込み中",
      storyBodyError: (message) => `生成済みストーリー本文を読み込めませんでした: ${message}`,
      storyBodyLoading: "ストーリー本文を読み込み中",
      storyBodyUnavailable:
        "このストーリーの生成済み本文 JSON はまだ準備されていません。source manifest には登録されていますが、本文ファイルが空か未解決です。",
      storyGroupMissing: "指定されたストーリーグループが見つかりません。",
      storyMissing: "指定されたストーリーが見つかりません。",
    },
    storyNavigation: {
      label: "ストーリーナビゲーション",
      next: "次へ ›",
      nextAria: (storyTitle) => `次のストーリー: ${storyTitle}`,
      previous: "‹ 前へ",
      previousAria: (storyTitle) => `前のストーリー: ${storyTitle}`,
    },
    storyNote: {
      close: "ストーリーメモを閉じる",
      label: "ストーリーメモ",
      open: "ストーリーメモを開く",
      placeholder: "このストーリーのメモ",
    },
  },
  kr: {
    appBar: {
      home: "홈",
      notes: "메모 모아보기",
      search: "검색",
      story: "스토리",
      themeDark: "다크 테마로 변경",
      themeLight: "라이트 테마로 변경",
    },
    archive: {
      generated: "생성됨",
      localeArchive: "언어 아카이브",
      references: "참조",
      storylines: "스토리라인",
      storyline: "스토리라인",
    },
    common: {
      aboutMinutes: (value) => `약 ${value}분`,
      chars: "글자",
      groups: "그룹",
      loading: "로딩 중",
      stories: "스토리",
    },
    group: {
      missing: "요청한 story group을 찾을 수 없습니다.",
    },
    home: {
      namePrompt: "당신의 이름은?",
      namePlaceholder: "박사 이름",
      continueReading: "이어서 읽기",
      openArchive: "스토리 둘러보기",
      serviceTitle: "ARK STR",
      serviceIntro:
        "명일방주의 방대한 서사를 스토리라인, 에피소드, 인물의 흔적으로 다시 읽는 로컬 퍼스트 아카이브입니다.",
      recommendationEyebrow: "추천 글 목록",
      statsTitle: "수록 통계",
      groups: "그룹",
      stories: "스토리",
      chars: "글자",
      minutes: "분",
      trails: "트레일",
      missing: "미수록",
      generatedAt: "콘텐츠 스냅샷",
      footer,
      collections: {
        terra_notes: "관리자의 테라노트",
        ancient_archive: "구인류 아카이브",
        explore_behemoth: "탐색: 베헤모스",
        explore_beast_lords: "탐색: 짐승 군주",
      },
    },
    notes: {
      editNote: (storyTitle) => `${storyTitle} 메모 수정`,
      empty: "아직 작성한 메모가 없습니다.",
      goToStory: "스토리로 이동",
      loading: "메모 로딩 중",
      title: "메모",
    },
    search: {
      empty: "검색어를 입력하면 현재 언어의 모든 스토리에서 찾아봅니다.",
      indexError: "검색 인덱스를 불러오지 못했습니다.",
      indexLoading: (localeLabel) => `${localeLabel} 검색 인덱스 로딩 중`,
      label: "스토리 검색",
      loadingMore: "검색 결과 추가 로딩 중",
      noResults: "일치하는 스토리가 없습니다.",
      placeholder: (localeLabel) => `${localeLabel} 스토리 검색`,
      resultStories: (value) => `${value}개 스토리`,
      title: "검색",
    },
    status: {
      assetManifestError: (message) => `generated asset manifest를 불러오지 못했습니다: ${message}`,
      contentIndexError: (message) => `generated content index를 불러오지 못했습니다: ${message}`,
      contentIndexLoading: "generated content index 로딩 중",
      storyBodyError: (message) => `generated story body를 불러오지 못했습니다: ${message}`,
      storyBodyLoading: "스토리 본문 로딩 중",
      storyBodyUnavailable:
        "이 스토리는 generated body JSON이 아직 준비되지 않았습니다. source manifest에는 등록되어 있지만 본문 파일이 비어 있거나 미해결 상태입니다.",
      storyGroupMissing: "요청한 story group을 찾을 수 없습니다.",
      storyMissing: "요청한 story를 찾을 수 없습니다.",
    },
    storyNavigation: {
      label: "스토리 이동",
      next: "다음 ›",
      nextAria: (storyTitle) => `다음 스토리: ${storyTitle}`,
      previous: "‹ 이전",
      previousAria: (storyTitle) => `이전 스토리: ${storyTitle}`,
    },
    storyNote: {
      close: "스토리 메모 닫기",
      label: "스토리 메모",
      open: "스토리 메모 열기",
      placeholder: "이 story에 남길 메모",
    },
  },
  tw: {
    appBar: {
      home: "首頁",
      notes: "查看筆記",
      search: "搜尋",
      story: "故事",
      themeDark: "切換到深色主題",
      themeLight: "切換到淺色主題",
    },
    archive: {
      generated: "已生成",
      localeArchive: "語言檔案",
      references: "引用",
      storylines: "故事線",
      storyline: "故事線",
    },
    common: {
      aboutMinutes: (value) => `約 ${value} 分鐘`,
      chars: "字",
      groups: "組",
      loading: "載入中",
      stories: "故事",
    },
    group: {
      missing: "找不到請求的故事組。",
    },
    home: {
      namePrompt: "你的名字是？",
      namePlaceholder: "博士代號",
      continueReading: "繼續閱讀",
      openArchive: "打開故事庫",
      serviceTitle: "ARK STR",
      serviceIntro:
        "一個本地優先的明日方舟敘事檔案，按故事線、篇章與人物痕跡重新整理泰拉的長篇文本。",
      recommendationEyebrow: "推薦閱讀",
      statsTitle: "收錄統計",
      groups: "組",
      stories: "故事",
      chars: "字",
      minutes: "分鐘",
      trails: "條線索",
      missing: "未收錄",
      generatedAt: "內容快照",
      footer,
      collections: {
        terra_notes: "管理員的泰拉筆記",
        ancient_archive: "舊人類檔案",
        explore_behemoth: "探索：巨獸",
        explore_beast_lords: "探索：獸主",
      },
    },
    notes: {
      editNote: (storyTitle) => `編輯 ${storyTitle} 的筆記`,
      empty: "還沒有寫下任何筆記。",
      goToStory: "打開故事",
      loading: "正在載入筆記",
      title: "筆記",
    },
    search: {
      empty: "輸入搜尋詞後，將在目前語言的所有故事中查找。",
      indexError: "無法載入搜尋索引。",
      indexLoading: (localeLabel) => `正在載入 ${localeLabel} 搜尋索引`,
      label: "故事搜尋",
      loadingMore: "正在載入更多搜尋結果",
      noResults: "沒有匹配的故事。",
      placeholder: (localeLabel) => `搜尋 ${localeLabel} 故事`,
      resultStories: (value) => `${value} 個故事`,
      title: "搜尋",
    },
    status: {
      assetManifestError: (message) => `無法載入生成的資源清單：${message}`,
      contentIndexError: (message) => `無法載入生成的內容索引：${message}`,
      contentIndexLoading: "正在載入生成的內容索引",
      storyBodyError: (message) => `無法載入生成的故事正文：${message}`,
      storyBodyLoading: "正在載入故事正文",
      storyBodyUnavailable:
        "這個故事的生成正文 JSON 尚未準備好。它已登記在 source manifest 中，但正文檔案為空或仍未解析。",
      storyGroupMissing: "找不到請求的故事組。",
      storyMissing: "找不到請求的故事。",
    },
    storyNavigation: {
      label: "故事導覽",
      next: "下一篇 ›",
      nextAria: (storyTitle) => `下一篇故事：${storyTitle}`,
      previous: "‹ 上一篇",
      previousAria: (storyTitle) => `上一篇故事：${storyTitle}`,
    },
    storyNote: {
      close: "關閉故事筆記",
      label: "故事筆記",
      open: "打開故事筆記",
      placeholder: "為這個故事留下筆記",
    },
  },
} satisfies Record<ReaderLocale, UiCopy>;

export function getUiCopy(locale: ReaderLocale): UiCopy {
  return UI_COPY[locale];
}

export function getUiDocumentLang(locale: ReaderLocale): string {
  return UI_DOCUMENT_LANG[locale];
}
