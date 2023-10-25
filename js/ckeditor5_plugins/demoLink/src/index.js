/**
 * @file
 * Defines the demoLink plugin.
 */

/**
 * @module demoLink/DemoLink
 */

import { Plugin } from 'ckeditor5/src/core';
import DemoLinkEditing from './demolinkediting';
import DemoLinkUI from './demolinkui';

/**
 * The DemoLink plugin.
 *
 * This is a "glue" plugin that loads
 * the {@link module:demoLink/DemoLinkEditing~DemoLinkEditing DemoLink editing feature}
 * and {@link module:demoLink/DemoLinkUI~DemoLinkUI DemoLink UI feature}.
 *
 * @extends module:core/plugin~Plugin
 */
class DemoLink extends Plugin {

  /**
   * @inheritdoc
   */
  static get requires() {
    return [DemoLinkEditing, DemoLinkUI];
  }

  /**
   * @inheritdoc
   */
  static get pluginName() {
    return 'demoLink';
  }

}

export default {
  DemoLink,
};
