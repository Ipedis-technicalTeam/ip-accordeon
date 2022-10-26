import {Component, h, Element, Prop, Watch, State} from "@stencil/core";
import {AccordeonHeadersInterface} from "./interface/accordeon-headers.interface";

@Component({
  tag: 'ip-accordeon',
  styleUrl: './ip-accordeon.scss',
  shadow: true
})
export class IpAccordeon {

  @Element() el: HTMLElement;

  private _accordeonHeaders: AccordeonHeadersInterface[];
  @Prop() accordeonHeaders: AccordeonHeadersInterface[] | string;

  @Watch('accordeonHeaders')
  arrayDataWatcher(newValue: AccordeonHeadersInterface[] | string) {
    if (typeof newValue === 'string') {
      this._accordeonHeaders = JSON.parse(newValue);
    } else {
      this._accordeonHeaders = newValue;
    }
  }

  @State() accHeaderButtons;
  @State() accPanels;

  componentWillLoad() {
    this.arrayDataWatcher(this.accordeonHeaders);
  }

  componentDidLoad() {

    this.accHeaderButtons = this.el.shadowRoot.querySelector('#ip-accordeon').querySelectorAll('button');
    this.accPanels = this.el.shadowRoot.querySelector('#ip-accordeon').querySelectorAll('.js-panel');

    // By default set first item to open
    (this.accHeaderButtons[0] as HTMLElement).setAttribute('aria-expanded', 'true');
    (this.accPanels[0] as HTMLElement).classList.remove('js-panel-hide');

    // For accessibility - set an id on the slotted elements
    const slottedElems = this.el.querySelectorAll('[slot]');
    slottedElems.forEach((slotElem, index) => {
      slotElem.setAttribute('id', 'sect-' + (index+1))
    });

  }

  onSelectPanel(index: number) {

    // to do - seperate code in dedicated function
    const selectedButton = this.accHeaderButtons[index];
    const selectedPanel = this.accPanels[index];

    if (selectedPanel.offsetHeight === 0) {
      selectedPanel.style.height =  selectedPanel.scrollHeight + 'px';
    } else {
      selectedPanel.style.height =  '0px';
    }

    if (selectedButton.getAttributeNode('aria-expanded').value === 'true') {
      selectedButton.setAttribute('aria-expanded', 'false');
    } else {
      selectedButton.setAttribute('aria-expanded', 'true');
    }

  }

  render() {

    const accPanels = (
      <div>
        {this._accordeonHeaders.map((tabHeader, index) => (
            [
              <h3 class="js-acc-button">
                <button
                  onClick={this.onSelectPanel.bind(this,  (index))}
                  aria-expanded="false"
                  aria-controls={`sect-${index + 1}`}
                  id={`accordeon-${index + 1}`}>
                  <span class="accordion-title">
                    {tabHeader.title}
                  </span>
                  <span>^</span>
                </button>
              </h3>,
              <div id={`sect-${index + 1}`} role="region" aria-labelledby={`accordeon-${index + 1}`} class='js-panel'>
                <slot name={'accordeon-' + (index + 1)}></slot>
              </div>
            ]
          ))
        }
      </div>
    )

    return [
      <div class='ip-accordeon' id='ip-accordeon'>
        { accPanels }
      </div>
    ]
  }

}
