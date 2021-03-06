﻿import { named, injectable, inject } from 'inversify';
import ResizeObserver from 'resize-observer-polyfill';
import MediaGlobalService from './mediaGlobalService';
import DebounceService from './debounceService';
import GlobalService from './globalService';
import * as SmoothScroll from 'smooth-scroll';
import { MediaWidth } from './mediaWidth';

@injectable()
export default class ArticleGlobalService implements GlobalService {
    private _mediaGlobalService: MediaGlobalService;
    private _debounceService: DebounceService;

    // TODO should be readonly
    private _headerElements: NodeList;
    private _bodyResizeObserver: ResizeObserver;
    private _headerMarginTops: number[];
    private _updateHistoryDebounced: () => void;
    private _headerHashes: string[];
    private _activeHeaderIndexFixed: boolean;
    private _indexChangedListeners: ((newIndex: number) => void)[];
    private _activeHeaderIndex: number;

    public constructor(
        @inject('GlobalService') @named('MediaGlobalService') mediaGlobalService: MediaGlobalService,
        debounceService: DebounceService) {
        this._mediaGlobalService = mediaGlobalService;
        this._debounceService = debounceService;
    }

    public setupOnDomContentLoaded(): void {
    }

    public setupImmediate(): void {
        this._headerElements = document.querySelectorAll('.jtcd-article .header-1, .jtcd-article .header-2');

        this._bodyResizeObserver = new ResizeObserver(this.onScrollAndResizeListener);
        this._headerMarginTops = [];
        this._indexChangedListeners = [];
        this._updateHistoryDebounced = this._debounceService.createTimeoutDebounceFunction(this.updateHistory, 100);

        this.setupHeaderHashes();
    }

    public setupOnLoad(): void {
        // When smooth scroll initializes, it reads header height. Therefore it can only be called after the load event.
        this.setupSmoothScroll();
        this.setupHeaderMarginTops();

        // Simulate scroll to hash
        this.smoothScrollBefore();
        this.smoothScrollAfter();

        this._bodyResizeObserver.observe(document.body);
        window.addEventListener('resize', this.onScrollAndResizeListener);
        window.addEventListener('scroll', this.onScrollAndResizeListener);

        // TODO use IntersectionObserver instead of scroll/resize 
        //  - IntersectionObserver to work, article must be divided into sections
        //  - Keep track of all sections that intersect the viewport (using threshold 0), the section closest to the top of the article
        //    is the active one.
        // TODO use rootMargin to account for dropdown headers and for common space above headers
        //this._initialIntersectionCall = true;
        //let intersectionObserver = new IntersectionObserver(this.onIntersectionListener, { threshold: 1 });
        //for (let i = 0; i < this._headerElements.length; i++) {
        //    intersectionObserver.observe(this._headerElements[i] as HTMLElement);
        //}
    }

    //private onIntersectionListener = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
    //}

    public addIndexChangedListener(listener: (newIndex: number) => void, init: boolean = false) {
        this._indexChangedListeners.push(listener);

        if (init) {
            listener(this._activeHeaderIndex);
        }
    }

    public removeIndexChangedListener(listener: (newIndex: number) => void) {
        let index = this._indexChangedListeners.indexOf(listener);

        if (index > -1) {
            this._indexChangedListeners.splice(index, 1);
        }
    }

    private onScrollAndResizeListener = (): void => {
        if (!this._activeHeaderIndexFixed) {
            this.updateActiveHeaderIndex();
        }
    }

    private updateActiveHeaderIndex(): void {
        let headerHeight = this._mediaGlobalService.mediaWidthIs(MediaWidth.narrow) ? 37 : 0;
        let activeHeaderIndex: number = this._headerMarginTops.length - 1;

        for (let i = 0; i < this._headerElements.length; i++) {
            if ((this._headerElements[i] as HTMLElement).getBoundingClientRect().top - this._headerMarginTops[i] > headerHeight) {
                activeHeaderIndex = i - 1;
                break;
            }
        }

        if (this.setActiveHeaderIndex(activeHeaderIndex)) {
            this._updateHistoryDebounced();
        }
    }

    private setupHeaderHashes(): void {
        this._headerHashes = [];

        for (let i = 0; i < this._headerElements.length; i++) {
            this._headerHashes[i] = `#${(this._headerElements[i] as HTMLElement).id}`;
        }
    }

    private setupHeaderMarginTops() {
        for (let i = 0; i < this._headerElements.length; i++) {
            this._headerMarginTops.push(parseFloat(getComputedStyle(this._headerElements[i] as HTMLElement).marginTop));
        }
    }

    public getActiveHeaderIndex(): number {
        return this._activeHeaderIndex;
    }

    public getHeaderElements(): NodeList {
        return this._headerElements;
    }

    private setupSmoothScroll(): void {
        new SmoothScroll('a[href*="#"]', {
            speed: 300,
            before: this.smoothScrollBefore,
            after: this.smoothScrollAfter,
            header: '#article-menu-header'
        });
    }

    // Chrome and edge have rendering issues if activeHeaderIndex changes rapidly and knob translate/scale are updated rapidly.
    // Fixing activeHeaderIndex on smooth-scroll avoids these rendering issues.
    private smoothScrollBefore = (): void => {
        let hash = location.hash;

        this._activeHeaderIndexFixed = true;

        if (!hash || hash === '#smooth-scroll-top') {
            if (this.setActiveHeaderIndex(-1)) {
                this.updateHistory();
            }
            return;
        }

        for (let i = 0; i < this._headerHashes.length; i++) {
            if (hash === this._headerHashes[i]) {
                // Ensure that header can be scrolled to
                while (document.body.getBoundingClientRect().bottom - (this._headerElements[i] as HTMLElement).getBoundingClientRect().top - this._headerMarginTops[i] < window.innerHeight) {
                    i--;
                    if (i === -1) {
                        break;
                    }
                }

                this.setActiveHeaderIndex(i);
                // Regardless location hash may have changed even if index remains the same
                this.updateHistory();

                return;
            }
        }

        // Navigating to element that isn't an article header
        this._activeHeaderIndexFixed = false;
    }

    private setActiveHeaderIndex(newIndex: number): boolean {
        if (newIndex === this._activeHeaderIndex) {
            return false;
        }

        this._activeHeaderIndex = newIndex;

        for (let i = 0; i < this._indexChangedListeners.length; i++) {
            this._indexChangedListeners[i](newIndex);
        }

        return true;
    }

    private smoothScrollAfter = (): void => {
        // Note: scroll listener fires one last time after smoothScrollAfter is called
        this._activeHeaderIndexFixed = false;
    }

    private updateHistory = (): void => {
        let id = this._activeHeaderIndex > -1 ? (this._headerElements[this._activeHeaderIndex] as HTMLElement).getAttribute('id') : null;
        let url = id ? `#${id}` : location.pathname;

        if (url === location.hash) {
            return;
        }

        history.replaceState(null, null, url);
    }
}
