import {Component, h, Element, State} from "@stencil/core";

@Component({
  tag: 'ip-accordeon',
  styleUrl: './ip-accordeon.scss',
  shadow: true
})
export class IpAccordeon {

  @Element() el: HTMLElement;

  @State() accButtons;

  componentWillLoad() {

    const accButtons = this.el.querySelectorAll('.js-acc-button button');
    const accPanels = this.el.querySelectorAll('.js-acc-panel');

    accButtons.forEach((accButton, index) => {
      accButton.addEventListener('click', ()=> {
        if (accPanels[index].classList.contains('js-acc-panel-hide')) {
          accPanels[index].classList.remove('js-acc-panel-hide');
        } else {
          accPanels[index].classList.add('js-acc-panel-hide');
        }

        if (accButton.getAttributeNode('aria-expanded').value === 'true') {
          accButton.setAttribute('aria-expanded', 'false');
        } else {
          accButton.setAttribute('aria-expanded', 'true');
        }
      })
    })


  }

  render() {
    return <div class='acc-contents'>
      <slot name='accordeon-1'></slot>
      <slot name='accordeon-2'></slot>
      <slot name='accordeon-3'></slot>
    </div>
  }
}
