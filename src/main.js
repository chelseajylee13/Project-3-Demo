import './styles/index.css';
import { createApp } from './views/createApp.js';

const root = document.querySelector('#app');

if (!root) {
  throw new Error('PUPCAST could not find its application root.');
}

createApp(root);
