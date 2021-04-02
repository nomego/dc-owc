import { html } from 'lit-html';
import '../src/dc-owc.js';

export default {
  title: 'DcOwc',
  component: 'dc-owc',
  argTypes: {
    backgroundColor: { control: 'color' },
  },
};

function Template({ title, backgroundColor }) {
  return html`
    <dc-owc
      style="--dc-owc-background-color: ${backgroundColor || 'white'}"
      .title=${title}
    >
    </dc-owc>
  `;
}

export const App = Template.bind({});
App.args = {
  title: 'My app',
};
