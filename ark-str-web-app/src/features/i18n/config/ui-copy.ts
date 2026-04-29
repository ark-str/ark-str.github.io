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
    settings: string;
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
    syntheticTitles: Record<string, string>;
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
  settings: {
    apiKeyHelp: string;
    apiKeyIssueGuide: string[];
    apiKeyIssueGuideTitle: string;
    apiKeyLabel: string;
    apiKeyLink: string;
    apiKeyPlaceholder: string;
    apiKeyWarning: string;
    backupDescription: string;
    backupTitle: string;
    confirmResetNotes: string;
    confirmResetReadProgress: string;
    dangerTitle: string;
    exportData: string;
    importData: string;
    importInvalid: string;
    importSuccess: string;
    issueDescription: string;
    issueLink: string;
    nameLabel: string;
    namePlaceholder: string;
    resetNotes: string;
    resetReadProgress: string;
    resetSuccess: string;
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
  storyActions: {
    aiSummary: string;
    aiSummaryError: (message: string) => string;
    aiSummaryLoading: string;
    aiSummaryNoText: string;
    aiSummaryRequestFailed: string;
    aiSummaryResult: string;
    apiKeyRequired: string;
    openSettings: string;
    bottomLabel: string;
    markRead: string;
    markUnread: string;
    readBadge: string;
    topLabel: string;
  };
  storyBody: {
    availableResponses: string;
    doctorChoice: string;
    sceneBreak: string;
    summary: string;
    top: string;
    wirelessLink: string;
  };
  storyNote: {
    close: string;
    label: string;
    open: string;
    placeholder: string;
    shortLabel: string;
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
      settings: "设置",
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
      syntheticTitles: {
        synthetic_operator_narratives: "干员叙事",
        synthetic_uncategorized: "未分类",
      },
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
    settings: {
      apiKeyHelp: "API key 仅保存在此浏览器，不会包含在备份 JSON 中。",
      apiKeyIssueGuide: [
        "打开 Google AI Studio，使用自己的 Google 帐号登录。",
        "进入 API keys 页面并创建新的 Gemini API key。",
        "复制生成的 key，并只粘贴到你信任的个人设备上。",
      ],
      apiKeyIssueGuideTitle: "API key 获取方法",
      apiKeyLabel: "Google AI Studio API key",
      apiKeyLink: "打开",
      apiKeyPlaceholder: "输入 Gemini API key",
      apiKeyWarning: "不要在公共或共享设备上保存 API key。",
      backupDescription: "导出或恢复本地笔记、阅读状态、会话和已识别角色信息。",
      backupTitle: "数据备份",
      confirmResetNotes: "要删除所有笔记吗？此操作无法撤销。",
      confirmResetReadProgress: "要清除所有已读记录吗？此操作无法撤销。",
      dangerTitle: "危险区域",
      exportData: "导出 JSON",
      importData: "导入 JSON",
      importInvalid: "备份文件无法读取。",
      importSuccess: "备份已恢复。",
      issueDescription: "通过 GitHub issue 提交问题或功能请求。",
      issueLink: "提交 GitHub issue",
      nameLabel: "名字",
      namePlaceholder: "博士代号",
      resetNotes: "清空笔记",
      resetReadProgress: "清空已读记录",
      resetSuccess: "本地数据已重置。",
      title: "设置",
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
    storyActions: {
      aiSummary: "AI 摘要",
      aiSummaryError: (message) => `摘要生成失败：${message}`,
      aiSummaryLoading: "正在生成摘要",
      aiSummaryNoText: "没有可摘要的正文。",
      aiSummaryRequestFailed: "无法生成摘要。请检查 API key 或稍后重试。",
      aiSummaryResult: "AI 摘要",
      apiKeyRequired: "请先在设置中保存 Google AI Studio API key。",
      openSettings: "打开设置",
      bottomLabel: "故事操作",
      markRead: "标记为已读",
      markUnread: "取消已读",
      readBadge: "已读",
      topLabel: "故事操作",
    },
    storyBody: {
      availableResponses: "可用回复",
      doctorChoice: "博士选择",
      sceneBreak: "场景分隔",
      summary: "摘要",
      top: "顶部",
      wirelessLink: "无线通讯",
    },
    storyNote: {
      close: "关闭故事笔记",
      label: "故事笔记",
      open: "打开故事笔记",
      placeholder: "为这个故事留下笔记",
      shortLabel: "笔记",
    },
  },
  en: {
    appBar: {
      home: "Home",
      notes: "View notes",
      search: "Search",
      settings: "Settings",
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
      syntheticTitles: {
        synthetic_operator_narratives: "Operator Narratives",
        synthetic_uncategorized: "Uncategorized",
      },
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
    settings: {
      apiKeyHelp: "The API key is stored only in this browser and is excluded from backup JSON.",
      apiKeyIssueGuide: [
        "Open Google AI Studio and sign in with your Google account.",
        "Go to API keys and create a new Gemini API key.",
        "Copy the generated key, then paste it only on a personal device you trust.",
      ],
      apiKeyIssueGuideTitle: "How to get an API key",
      apiKeyLabel: "Google AI Studio API key",
      apiKeyLink: "Open",
      apiKeyPlaceholder: "Enter Gemini API key",
      apiKeyWarning: "Do not save an API key on a public or shared device.",
      backupDescription: "Export or restore local notes, read status, session data, and observed character data.",
      backupTitle: "Data backup",
      confirmResetNotes: "Delete every note? This cannot be undone.",
      confirmResetReadProgress: "Clear every read story marker? This cannot be undone.",
      dangerTitle: "Danger zone",
      exportData: "Export JSON",
      importData: "Import JSON",
      importInvalid: "The backup file could not be read.",
      importSuccess: "Backup restored.",
      issueDescription: "Open a GitHub issue for bugs or feature requests.",
      issueLink: "Open GitHub issue",
      nameLabel: "Name",
      namePlaceholder: "Doctor codename",
      resetNotes: "Reset notes",
      resetReadProgress: "Reset read stories",
      resetSuccess: "Local data was reset.",
      title: "Settings",
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
    storyActions: {
      aiSummary: "AI summary",
      aiSummaryError: (message) => `Summary failed: ${message}`,
      aiSummaryLoading: "Generating summary",
      aiSummaryNoText: "No story text is available to summarize.",
      aiSummaryRequestFailed: "The summary could not be generated. Check the API key or try again later.",
      aiSummaryResult: "AI summary",
      apiKeyRequired: "Save a Google AI Studio API key in Settings first.",
      openSettings: "Open settings",
      bottomLabel: "Story actions",
      markRead: "Mark read",
      markUnread: "Mark unread",
      readBadge: "Read",
      topLabel: "Story actions",
    },
    storyBody: {
      availableResponses: "Available responses",
      doctorChoice: "Doctor choice",
      sceneBreak: "Scene break",
      summary: "Summary",
      top: "Top",
      wirelessLink: "Wireless link",
    },
    storyNote: {
      close: "Close story note",
      label: "Story note",
      open: "Open story note",
      placeholder: "Note for this story",
      shortLabel: "Memo",
    },
  },
  jp: {
    appBar: {
      home: "ホーム",
      notes: "メモ一覧",
      search: "検索",
      settings: "設定",
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
      syntheticTitles: {
        synthetic_operator_narratives: "オペレーターの物語",
        synthetic_uncategorized: "未分類",
      },
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
    settings: {
      apiKeyHelp: "API key はこのブラウザにのみ保存され、バックアップ JSON には含まれません。",
      apiKeyIssueGuide: [
        "Google AI Studio を開き、自分の Google アカウントでログインします。",
        "API keys ページで新しい Gemini API key を作成します。",
        "生成された key をコピーし、信頼できる個人端末にだけ貼り付けます。",
      ],
      apiKeyIssueGuideTitle: "API key の発行方法",
      apiKeyLabel: "Google AI Studio API key",
      apiKeyLink: "開く",
      apiKeyPlaceholder: "Gemini API key を入力",
      apiKeyWarning: "共有端末や公共の端末では API key を保存しないでください。",
      backupDescription: "ローカルのメモ、既読状態、セッション、観測済みキャラクター情報をエクスポートまたは復元します。",
      backupTitle: "データバックアップ",
      confirmResetNotes: "すべてのメモを削除しますか？この操作は元に戻せません。",
      confirmResetReadProgress: "すべての既読記録を削除しますか？この操作は元に戻せません。",
      dangerTitle: "DANGER ZONE",
      exportData: "JSON をエクスポート",
      importData: "JSON をインポート",
      importInvalid: "バックアップファイルを読み取れませんでした。",
      importSuccess: "バックアップを復元しました。",
      issueDescription: "不具合や機能要望は GitHub issue で送信できます。",
      issueLink: "GitHub issue を開く",
      nameLabel: "名前",
      namePlaceholder: "ドクター名",
      resetNotes: "メモを初期化",
      resetReadProgress: "既読記録を初期化",
      resetSuccess: "ローカルデータを初期化しました。",
      title: "設定",
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
    storyActions: {
      aiSummary: "AI要約",
      aiSummaryError: (message) => `要約に失敗しました: ${message}`,
      aiSummaryLoading: "要約を生成中",
      aiSummaryNoText: "要約できる本文がありません。",
      aiSummaryRequestFailed: "要約を生成できませんでした。API key を確認するか、後でもう一度お試しください。",
      aiSummaryResult: "AI要約",
      apiKeyRequired: "先に設定で Google AI Studio API key を保存してください。",
      openSettings: "設定を開く",
      bottomLabel: "ストーリー操作",
      markRead: "既読にする",
      markUnread: "既読を解除",
      readBadge: "既読",
      topLabel: "ストーリー操作",
    },
    storyBody: {
      availableResponses: "選択可能な返答",
      doctorChoice: "ドクターの選択",
      sceneBreak: "シーン区切り",
      summary: "要約",
      top: "上へ",
      wirelessLink: "無線通信",
    },
    storyNote: {
      close: "ストーリーメモを閉じる",
      label: "ストーリーメモ",
      open: "ストーリーメモを開く",
      placeholder: "このストーリーのメモ",
      shortLabel: "メモ",
    },
  },
  kr: {
    appBar: {
      home: "홈",
      notes: "메모 모아보기",
      search: "검색",
      settings: "설정",
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
      syntheticTitles: {
        synthetic_operator_narratives: "오퍼레이터 서사",
        synthetic_uncategorized: "미분류",
      },
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
    settings: {
      apiKeyHelp: "API key는 이 브라우저에만 저장되며 백업 JSON에는 포함되지 않습니다.",
      apiKeyIssueGuide: [
        "Google AI Studio를 열고 본인 Google 계정으로 로그인합니다.",
        "API keys 페이지에서 새 Gemini API key를 생성합니다.",
        "생성된 key를 복사한 뒤, 신뢰하는 개인 기기에만 붙여넣습니다.",
      ],
      apiKeyIssueGuideTitle: "API key 발급 방법",
      apiKeyLabel: "Google AI Studio API key",
      apiKeyLink: "이동",
      apiKeyPlaceholder: "Gemini API key 입력",
      apiKeyWarning: "공용 기기나 공유 기기에서는 API key를 저장하지 마세요.",
      backupDescription: "로컬 메모, 읽음 상태, 세션, 관찰된 캐릭터 데이터를 내보내거나 복구합니다.",
      backupTitle: "데이터 백업",
      confirmResetNotes: "모든 메모를 삭제할까요? 이 작업은 되돌릴 수 없습니다.",
      confirmResetReadProgress: "모든 읽은 스토리 기록을 삭제할까요? 이 작업은 되돌릴 수 없습니다.",
      dangerTitle: "DANGER ZONE",
      exportData: "JSON 내보내기",
      importData: "JSON 가져오기",
      importInvalid: "백업 파일을 읽을 수 없습니다.",
      importSuccess: "백업을 복구했습니다.",
      issueDescription: "버그 리포트와 기능 추가 요청은 GitHub issue로 남길 수 있습니다.",
      issueLink: "GitHub issue 열기",
      nameLabel: "이름",
      namePlaceholder: "박사 이름",
      resetNotes: "메모 초기화",
      resetReadProgress: "읽은 스토리 초기화",
      resetSuccess: "로컬 데이터를 초기화했습니다.",
      title: "설정",
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
    storyActions: {
      aiSummary: "AI 요약",
      aiSummaryError: (message) => `요약에 실패했습니다: ${message}`,
      aiSummaryLoading: "요약 생성 중",
      aiSummaryNoText: "요약할 본문이 없습니다.",
      aiSummaryRequestFailed: "요약을 생성하지 못했습니다. API key를 확인하거나 잠시 후 다시 시도해주세요.",
      aiSummaryResult: "AI 요약",
      apiKeyRequired: "먼저 설정에서 Google AI Studio API key를 저장해주세요.",
      openSettings: "설정으로 이동",
      bottomLabel: "스토리 기능",
      markRead: "읽음",
      markUnread: "읽음 해제",
      readBadge: "읽음",
      topLabel: "스토리 기능",
    },
    storyBody: {
      availableResponses: "선택 가능한 응답",
      doctorChoice: "박사의 선택",
      sceneBreak: "장면 전환",
      summary: "요약",
      top: "위로",
      wirelessLink: "무선 통신",
    },
    storyNote: {
      close: "스토리 메모 닫기",
      label: "스토리 메모",
      open: "스토리 메모 열기",
      placeholder: "이 story에 남길 메모",
      shortLabel: "메모",
    },
  },
  tw: {
    appBar: {
      home: "首頁",
      notes: "查看筆記",
      search: "搜尋",
      settings: "設定",
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
      syntheticTitles: {
        synthetic_operator_narratives: "幹員敘事",
        synthetic_uncategorized: "未分類",
      },
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
    settings: {
      apiKeyHelp: "API key 僅保存在此瀏覽器，不會包含在備份 JSON 中。",
      apiKeyIssueGuide: [
        "打開 Google AI Studio，使用自己的 Google 帳號登入。",
        "進入 API keys 頁面並建立新的 Gemini API key。",
        "複製生成的 key，並只貼到你信任的個人裝置上。",
      ],
      apiKeyIssueGuideTitle: "API key 取得方法",
      apiKeyLabel: "Google AI Studio API key",
      apiKeyLink: "打開",
      apiKeyPlaceholder: "輸入 Gemini API key",
      apiKeyWarning: "不要在公共或共享裝置上保存 API key。",
      backupDescription: "匯出或復原本機筆記、閱讀狀態、會話和已識別角色資訊。",
      backupTitle: "資料備份",
      confirmResetNotes: "要刪除所有筆記嗎？此操作無法復原。",
      confirmResetReadProgress: "要清除所有已讀記錄嗎？此操作無法復原。",
      dangerTitle: "危險區域",
      exportData: "匯出 JSON",
      importData: "匯入 JSON",
      importInvalid: "備份檔案無法讀取。",
      importSuccess: "備份已復原。",
      issueDescription: "透過 GitHub issue 提交問題或功能請求。",
      issueLink: "提交 GitHub issue",
      nameLabel: "名字",
      namePlaceholder: "博士代號",
      resetNotes: "清空筆記",
      resetReadProgress: "清空已讀記錄",
      resetSuccess: "本機資料已重置。",
      title: "設定",
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
    storyActions: {
      aiSummary: "AI 摘要",
      aiSummaryError: (message) => `摘要生成失敗：${message}`,
      aiSummaryLoading: "正在生成摘要",
      aiSummaryNoText: "沒有可摘要的正文。",
      aiSummaryRequestFailed: "無法生成摘要。請檢查 API key 或稍後重試。",
      aiSummaryResult: "AI 摘要",
      apiKeyRequired: "請先在設定中保存 Google AI Studio API key。",
      openSettings: "打開設定",
      bottomLabel: "故事操作",
      markRead: "標記為已讀",
      markUnread: "取消已讀",
      readBadge: "已讀",
      topLabel: "故事操作",
    },
    storyBody: {
      availableResponses: "可用回覆",
      doctorChoice: "博士選擇",
      sceneBreak: "場景分隔",
      summary: "摘要",
      top: "頂部",
      wirelessLink: "無線通訊",
    },
    storyNote: {
      close: "關閉故事筆記",
      label: "故事筆記",
      open: "打開故事筆記",
      placeholder: "為這個故事留下筆記",
      shortLabel: "筆記",
    },
  },
} satisfies Record<ReaderLocale, UiCopy>;

export function getUiCopy(locale: ReaderLocale): UiCopy {
  return UI_COPY[locale];
}

export function getUiDocumentLang(locale: ReaderLocale): string {
  return UI_DOCUMENT_LANG[locale];
}
