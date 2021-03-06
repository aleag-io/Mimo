import { injectable } from 'inversify';
import SvgService from './svgService';

@injectable()
export default class PaginationService {
    private _svgService: SvgService;

    public constructor(svgService: SvgService) {
        this._svgService = svgService;
    }

    public setupPagination(
        rootElement: HTMLElement,
        paginationParentElements: NodeList | HTMLElement[],
        itemsParentElement: HTMLElement,
        items: NodeList | HTMLElement[] | string[],
        onDomReady: () => void = null,
        numPerPage: number = 5,
        numPageButtons: number = 5): void {

        let firstIcon = this._svgService.createSvgExternalSpriteElement('material-design-first-page');
        let previousIcon = this._svgService.createSvgExternalSpriteElement('material-design-previous-page');
        let nextIcon = this._svgService.createSvgExternalSpriteElement('material-design-next-page');
        let lastIcon = this._svgService.createSvgExternalSpriteElement('material-design-last-page');

        $(paginationParentElements).
            twbsPagination({
                first: ' ',
                prev: ' ',
                next: ' ',
                last: ' ',
                totalPages: Math.ceil(items.length / numPerPage),
                visiblePages: numPageButtons,
                onPageClick: (_: JQueryEventObject, page) => {
                    let start = (page - 1) * numPerPage;
                    let currentSnippets = [].slice.call(items, start, start + numPerPage);

                    itemsParentElement.innerHTML = '';
                    for (let i = 0; i < currentSnippets.length; i++) {
                        let snippet = currentSnippets[i];

                        if (typeof snippet === 'string') {
                            itemsParentElement.appendChild(document.createRange().createContextualFragment(snippet));
                        }
                        else {
                            itemsParentElement.appendChild(snippet);
                        }
                    }

                    let firstAnchorElements = rootElement.querySelectorAll('.al-pagination > .first > a');
                    for (let i = 0; i < firstAnchorElements.length; i++) {
                        firstAnchorElements[i].appendChild(firstIcon.cloneNode(true));
                    }

                    let prevAnchorElements = rootElement.querySelectorAll('.al-pagination > .prev > a');
                    for (let i = 0; i < prevAnchorElements.length; i++) {
                        prevAnchorElements[i].appendChild(previousIcon.cloneNode(true));
                    }

                    let nextAnchorElements = rootElement.querySelectorAll('.al-pagination > .next > a');
                    for (let i = 0; i < nextAnchorElements.length; i++) {
                        nextAnchorElements[i].appendChild(nextIcon.cloneNode(true));
                    }

                    let lastAnchorElements = rootElement.querySelectorAll('.al-pagination > .last > a');
                    for (let i = 0; i < lastAnchorElements.length; i++) {
                        lastAnchorElements[i].appendChild(lastIcon.cloneNode(true));
                    }

                    if (onDomReady) {
                        onDomReady();
                    }
                }
            });
    }
}