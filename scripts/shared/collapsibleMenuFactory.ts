import { injectable } from 'inversify';
import CollapsibleMenu from './collapsibleMenu';
import StringService from './stringService';
import HeightService from './heightService';

@injectable()
export default class CollapsibleMenuFactory {
    private _stringService: StringService;
    private _heightService: HeightService;

    public constructor(
        stringService: StringService,
        heightService: HeightService) {

        this._stringService = stringService;
        this._heightService = heightService;
    }

    public build(rootElement: HTMLElement): CollapsibleMenu {
        let rootElementID = rootElement.getAttribute('id');
        let rootLIElements = document.querySelectorAll(`#${rootElementID} > ul > li`);
        let topicElements = document.querySelectorAll(`#${rootElementID} ul > li.expandable > span`);
        let topicAndPageElements = document.querySelectorAll(`#${rootElementID} li > a, #${rootElementID} li > span`);

        this.setPadding(topicAndPageElements);
        this.registerTopicListeners(topicElements);

        return new CollapsibleMenu(rootElement, rootLIElements, this._stringService, this._heightService);
    }

    private registerTopicListeners(topicElements: NodeList): void {
        for (let i = 0; i < topicElements.length; i++) {
            let topicElement = topicElements[i] as HTMLElement;

            topicElement.addEventListener('click', (event: Event) => {
                let parentLI = topicElement.parentElement;
                let childUl = parentLI.querySelector('ul');
                this._heightService.toggleHeightWithTransition(childUl, parentLI);
                event.preventDefault();
                // If event propogates, every parent li.expandable's click listener will
                // be called
                event.stopPropagation();
            });
        }
    }

    private setPadding(topicAndPageElements: NodeList): void {
        for (let i = 0; i < topicAndPageElements.length; i++) {
            let element = topicAndPageElements[i] as HTMLElement;
            let level = parseInt(element.getAttribute('data-level'));

            if (level === 1) {
                continue;
            }

            element.style.paddingLeft = `${(level - 1) * 14}px`;
        }
    }
}