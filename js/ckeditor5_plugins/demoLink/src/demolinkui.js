/**
 * @file
 * Defines the DemoLinkUI plugin.
 */

/**
 * @module demoLink/DemoLinkUI
 */

import { Plugin } from 'ckeditor5/src/core';
import {
  ButtonView,
  ContextualBalloon,
  clickOutsideHandler
} from 'ckeditor5/src/ui';
import demoLinkIcon from '../../../icons/demo-link.svg';
import FormView from './ui/demolinkformview';
import {
  findElement,
  Utils
} from './utils';

/**
 * The demoLink UI plugin. It introduces the `'demoLink'` button and the forms.
 *
 * It uses the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon plugin}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class DemoLinkUI extends Plugin {

  /**
   * @inheritDoc
   */
  static get requires() {
    return [ ContextualBalloon ];
  }

  /**
   * @inheritDoc
   */
  init() {
    // Create the balloon.
    this._balloon = this.editor.plugins.get( ContextualBalloon );

    this._addToolbarButton();
    this.formView = this._createFormView();
    this._handleSelection();
  }

  /**
   * Adds the demoLink toolbar button.
   *
   * @private
   */
  _addToolbarButton() {
    const editor = this.editor;

    editor.ui.componentFactory.add('demoLink', (locale) => {
      const buttonView = new ButtonView(locale);

      // Create the toolbar button.
      buttonView.set({
        label: editor.t('demoLink'),
        icon: demoLinkIcon,
        tooltip: true
      });

      // Bind button to the command.
      // The state on the button depends on the command values.
      const command = editor.commands.get('demoLink');
      buttonView.bind( 'isEnabled' ).to( command, 'isEnabled' );
      buttonView.bind( 'isOn' ).to( command, 'value', value => !!value );

      // Execute the command when the button is clicked.
      this.listenTo(buttonView, 'execute', () =>
        this._showUI(),
      );

      return buttonView;
    });
  }

  /**
   * Creates the form view.
   *
   * @returns {FormView}
   *   The form view instance.
   *
   * @private
   */
  _createFormView() {
    const formView = new FormView( this.editor.locale );

    // Form submit handler.
    this.listenTo( formView, 'submit', () => {

      let values = {
        demoLinkText: formView.textInputView.fieldView.element.value,
        demoLinkFileExtension: formView.fileExtensionInputView.fieldView.element.value,
        demoLinkUrl: formView.urlInputView.fieldView.element.value,
      };

      this.editor.execute('demoLink', values);

      // Hide the form view after submit.
      this._hideUI();
    } );

    // Hide the form view after clicking the "Cancel" button.
    this.listenTo( formView, 'cancel', () => {
      this._hideUI();
    } );


    // Hide the form view when clicking outside the balloon.
    clickOutsideHandler( {
      emitter: formView,
      activator: () => this._balloon.visibleView === formView,
      contextElements: [ this._balloon.view.element ],
      callback: () => this._hideUI()
    } );

    return formView;
  }

  /**
   * Adds the {@link #FormView} to the balloon and sets the form values.
   *
   * @private
   */
  _addFormView() {

    this._balloon.add({
      view: this.formView,
      position: this._getBalloonPositionData()
    });

    const command = this.editor.commands.get('demoLink');

    // Handle text input fields.
    Object.entries(Utils.getModelToInputFormFieldsMapping()).forEach(([modelName, formElName]) => {

      const formEl = this.formView[formElName];

      // Needed to display a placeholder of the elements being focused before.
      formEl.focus();

      const isEmpty = !command.value || !command.value[modelName] || command.value[modelName] === '';

      // Set URL default value.
      if (modelName === 'demoLinkUrl' && isEmpty) {
        formEl.fieldView.element.value = '#';
        formEl.set('isEmpty', false);
        return;
      }

      if (!isEmpty) {
        formEl.fieldView.element.value = command.value[modelName];
      }
      formEl.set('isEmpty', isEmpty);

    });

    // Reset the focus to the first form element.
    this.formView.focus();
  }

  /**
   * Handles the selection specific cases (right before or after the element).
   *
   * @private
   */
  _handleSelection() {
    const editor = this.editor;

    this.listenTo(editor.editing.view.document, 'selectionChange', (eventInfo, eventData) => {
      const selection = editor.model.document.selection;

      let el = selection.getSelectedElement() ?? selection.getFirstRange().getCommonAncestor();

      // The selected element is outside of a demo link.
      if (!['demoLinkText', 'demoLinkFileExtension'].includes(el.name)) {
        this._hideUI();
        return;
      }

      this._showUI();

      const positionBefore = editor.model.createPositionBefore(el);
      const positionAfter = editor.model.createPositionAfter(el);

      const position = selection.getFirstPosition();

      // Define which child element will be used for afterTouch;
      const demoLinkEl = findElement(selection, 'demoLink');
      var hasFileExtension = false;
      for (const child of demoLinkEl.getChildren()) {
        if (child.name === 'demoLinkFileExtension') {
          hasFileExtension = true;
          continue;
        }
      }
      const afterTouchChildElName = hasFileExtension ? 'demoLinkFileExtension' : 'demoLinkText';

      const beforeTouch = el.name == 'demoLinkText' && position.isTouching( positionBefore );
      const afterTouch = el.name == afterTouchChildElName && position.isTouching( positionAfter );

      // Handle the "border" selection.
      if (beforeTouch || afterTouch) {
        editor.model.change(writer => {
          writer.setSelection(el.findAncestor('demoLink'), 'on');
        });
      }

    });
  }

  /**
   * Shows the UI.
   *
   * @private
   */
  _showUI() {
    this._addFormView();
  }

  /**
   * Hide the UI.
   *
   * @private
   */
  _hideUI() {
    const formView = this.formView;

    // Without this a new form contains the old values.
    if (formView.element) {
      formView.element.reset();
    }

    if (this._balloon.hasView(formView)) {
      this._balloon.remove(formView);
    }

    // Focus the editing view after closing the form view.
    this.editor.editing.view.focus();
  }

  /**
   * Gets balloon position.
   *
   * @returns {{target: (function(): *)}}
   *
   * @private
   */
  _getBalloonPositionData() {
    const view = this.editor.editing.view;
    const viewDocument = view.document;
    let target = null;

    // Set a target position by converting view selection range to DOM.
    target = () => view.domConverter.viewRangeToDom(
      viewDocument.selection.getFirstRange()
    );

    return {
      target
    };
  }

}
