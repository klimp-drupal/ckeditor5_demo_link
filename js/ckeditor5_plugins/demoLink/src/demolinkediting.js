/**
 * @file
 * Defines the DemoLinkEditing plugin.
 */

/**
 * @module demoLink/DemoLinkEditing
 */

import {Plugin} from 'ckeditor5/src/core';
import DemoLinkCommand from "./demolinkcommand";

/**
 * The demoLink editing feature.
 *
 * It introduces the 'demoLink' element in the model.
 *
 * @extends module:core/plugin~Plugin
 */
export default class DemoLinkEditing extends Plugin {

  /**
   * @inheritDoc
   */
  init() {
    this._defineSchema();
    this._defineConverters();

    // Attaching the command to the editor.
    this.editor.commands.add(
      'demoLink',
      new DemoLinkCommand(this.editor),
    );

  }

  /**
   * Registers schema for demoLink and its child elements.
   *
   * @private
   */
  _defineSchema() {
    const schema = this.editor.model.schema;

    // demoLink (parent element).
    schema.register('demoLink', {
      inheritAllFrom: '$inlineObject',
      allowAttributes: [
        'demoLinkUrl',

        // Needed to avoid conflicts with the 'linkClass' model attribute.
        'demoLinkClass'

      ],
      allowChildren: [
        'demoLinkText',
        'demoLinkFileExtension',
      ],
    });

    // Text and file extension (child elements).
    schema.register('demoLinkText', {
      allowIn: 'demoLink',
      isLimit: true,
      allowContentOf: '$block',
    });
    schema.register('demoLinkFileExtension', {
      allowIn: 'demoLink',
      isLimit: true,
      allowContentOf: '$block',
    });

  }

  /**
   * Defines converters.
   */
  _defineConverters() {
    const {conversion} = this.editor;

    // demoLink. View -> Model.
    conversion.for('upcast').elementToElement({
      view: {
        name: 'a'
      },
      model: (viewElement, {writer}) => {

        // Do not convert if the link does not have the 'demo-link' class.
        // @todo: set classes: 'demo-link' for the view and convert properly.
        const classes = viewElement.getAttribute('class');
        if (!classes) {
          return null;
        }
        if (!classes.split(' ').includes('demo-link')) {
          return null;
        }

        var attrs = {
          'demoLinkUrl': viewElement.getAttribute('href')
        };

        return writer.createElement( 'demoLink', attrs );
      }
    });

    // demoLink. Model -> View.
    conversion.for('downcast').elementToElement({
      model: 'demoLink',
      view: (modelElement, {writer}) => {

        var htmlAttrs = {
          'class': 'demo-link',
          'href': modelElement.getAttribute('demoLinkUrl')
        };

        return writer.createContainerElement('a', htmlAttrs);
      }
    });

    // href to demoLinkUrl. View -> Model.
    conversion.for('upcast').attributeToAttribute({
      view: {
        name: 'a',
        attributes: {
          ['href']: true
        }
      },
      model: {
        key: 'demoLinkUrl',
        value: viewElement => {
          return viewElement.getAttribute('href');
        }
      },
    });

    // class" to demoLinkClass. View -> Model.
    // Needed to avoid conflicts with the 'linkClass' model attribute
    // bound to the same HTML "class" attribute.
    conversion.for('upcast').attributeToAttribute({
      view: {
        name: 'a',
        attributes: {
          ['class']: true
        }
      },
      model: {
        key: 'demoLinkClass',
        value: viewElement => {
          return viewElement.getAttribute('class');
        }
      },
    });

    // demoLinkText. View -> Model.
    conversion.for('upcast').elementToElement({
      view: {
        name: 'span',
        classes: 'text',
      },
      model: ( viewElement, { writer } ) => {
        return writer.createElement('demoLinkText');
      }
    });

    // demoLinkText. Model -> View.
    conversion.for('downcast').elementToElement({
      model: 'demoLinkText',
      view: ( modelElement, { writer: viewWriter } ) => {
        return viewWriter.createContainerElement('span', {class: 'text'});
      }
    });

    // demoLinkFileExtension. View -> Model.
    conversion.for('upcast').elementToElement({
      view: {
        name: 'small',
        classes: 'file-extension',
      },
      model: ( viewElement, { writer } ) => {
        return writer.createElement( 'demoLinkFileExtension');
      }
    });

    // demoLinkFileExtension. Model -> View.
    conversion.for('downcast').elementToElement({
      model: 'demoLinkFileExtension',
      view: ( modelElement, { writer: viewWriter } ) => {
        return viewWriter.createContainerElement('small', {class: 'file-extension'});
      }
    });

  }

}
