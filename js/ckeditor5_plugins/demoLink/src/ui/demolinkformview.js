/**
 * @file
 * Defines the FormView View class.
 */

/**
 * @module demoLink/ui/DemoLinkFormView
 */

import {
  ButtonView,
  // Model,
  LabeledFieldView,
  View,
  createLabeledInputText,
  submitHandler,
} from "ckeditor5/src/ui";
import { icons } from "ckeditor5/src/core";

/**
 * The demoLink FormView class.
 *
 * This view displays an editing form for {@link module:demoLink/demoLink~DemoLink}.
 *
 * @extends module:ui/view~View
 */
export default class FormView extends View {

  /**
   * @inheritDoc
   */
  constructor( locale ) {
    super( locale );

    // Text inputs.
    this.textInputView = this._createInput('Text', { required: true });
    this.fileExtensionInputView = this._createInput('File extension');
    this.urlInputView = this._createInput('URL', {required: true});

    // Create the save button.
    this.saveButtonView = this._createButton(
      'Save', icons.check, 'ck-button-save'
    );

    // Triggers the submit event on entire form when clicked.
    this.saveButtonView.type = 'submit';

    // Create the cancel button.
    this.cancelButtonView = this._createButton(
      'Cancel', icons.cancel, 'ck-button-cancel'
    );

    // Delegate ButtonView#execute to FormView#cancel.
    this.cancelButtonView.delegate( 'execute' ).to( this, 'cancel' );

    this.childViewsCollection = this.createCollection([
      this.textInputView,
      this.fileExtensionInputView,
      this.urlInputView,
      this.saveButtonView,
      this.cancelButtonView
    ]);

    this.setTemplate( {
      tag: 'form',
      attributes: {
        class: [ 'ck', 'ck-demo-link-form' ],

        // https://github.com/ckeditor/ckeditor5-image/issues/40
        tabindex: '-1'
      },
      children: this.childViewsCollection
    } );

  }

  /**
   * @inheritDoc
   */
  render() {
    super.render();

    // Submit the form when the user clicked the save button
    // or pressed enter in the input.
    submitHandler( {
      view: this
    } );
  }

  /**
   * Focus on the first form element.
   */
  focus() {
    this.childViewsCollection.first.focus();
  }

  /**
   * Creates an input field.
   *
   * @param {string} label
   *   Input field label.
   * @param {object} options
   *   Options.
   *
   * @returns {module:ui/labeledfield/labeledfieldview~LabeledFieldView}
   *   The labeled field view class instance.
   *
   * @private
   */
  _createInput(label, options = {}) {
    const labeledFieldView = new LabeledFieldView(this.locale, createLabeledInputText);
    labeledFieldView.label = label;

    // Sets the required attribute when needed.
    if (options.required && options.required === true) {
      labeledFieldView.fieldView.extendTemplate({
        attributes: {
          required: true,
        }
      });
    }

    return labeledFieldView;
  }

  /**
   * Creates button.
   *
   * @param {string} label
   *   Button label.
   * @param {module:ui/icon/iconview~IconView} icon
   *   Button icon.
   * @param {string} className
   *   HTML class.
   *
   * @returns {module:ui/button/buttonview~ButtonView}
   *   The button view class instance.
   *
   * @private
   */
  _createButton( label, icon, className ) {
    const button = new ButtonView();

    button.set({
      label,
      icon,
      tooltip: true,
      class: className
    });

    return button;
  }

}
