export interface NoticeBar {
    enabled: boolean;
    text: string;
    type: string;
    template: string;
    link: string;
    buttonText: string;
    bgColor: string;
    textColor: string;
    buttonColor: string;
}

export interface FeaturedContent {
    contentId: string;
    contentType: 'movie' | 'tvSeries';
    addedAt: Date;
}

export interface Settings {
    adBlockEnabled: boolean;
    popupBlockEnabled: boolean;
    redirectBlockEnabled: boolean;
    blockSocialMedia: boolean;
    blockTracking: boolean;
    blockInlineScripts: boolean;
    noticeBar: NoticeBar;
    featuredContent: FeaturedContent[];
} 