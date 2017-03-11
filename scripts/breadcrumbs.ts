﻿import { generateMultiLevelList, ListItem, toggleHeightForTransition, contractHeightWithoutTransition } from './utils';

class BreadcrumbsBuilder {
    breadcrumbs: ListItem[] = [];
    rootBreadcrumbLoaded: boolean = false;
    childBreadcrumbsLoaded: boolean = false;

    build() {
        let html = generateMultiLevelList(this.breadcrumbs,
            'breadcrumb',
            1);
        $('#breadcrumbs>.container').prepend(html);

        $('#toc-button').on('click', (event: JQueryEventObject) => {
            toggleHeightForTransition($('#left-menu'), $(event.delegateTarget));
        });

        $(window).on('resize', () => {
            contractHeightWithoutTransition($('#left-menu'), $('#toc-button'));
        });
    }

    loadRootBreadCrumb(anchorElement: HTMLAnchorElement) {
        if (!this.rootBreadcrumbLoaded) {
            this.breadcrumbs.unshift({
                href: anchorElement.href,
                innerHtml: anchorElement.innerHTML,
                items: null
            });

            this.rootBreadcrumbLoaded = true;
            if (this.childBreadcrumbsLoaded) {
                this.build();
            }
        }
    }

    loadChildBreadcrumbs(anchorElements: HTMLAnchorElement[]) {
        if (!this.childBreadcrumbsLoaded) {
            for (let i = anchorElements.length - 1; i >= 0; i--) {
                this.breadcrumbs.push({
                    href: anchorElements[i].href,
                    innerHtml: anchorElements[i].innerHTML,
                    items: null
                });
            }

            this.childBreadcrumbsLoaded = true;
            if (this.rootBreadcrumbLoaded) {
                this.build();
            }
        }
    }
}

export default new BreadcrumbsBuilder();

