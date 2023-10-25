/**
 * @file
 * Defines the DemoLinkCommand plugin.
 */

import { Command } from 'ckeditor5/src/core';
import {
  findElement,
  Utils,
} from "./utils";

/**
 * The demoLink command.
 *
 * Used by the {@link module:demoLink/demoLink~DemoLink} plugin.
 *
 * @extends module:core/command~Command
 */
export default class DemoLinkCommand extends Command {

  /**
   * @inheritDoc
   */
  refresh() {
    // Demo link Toolbar button is always enabled.
    this.isEnabled = true;

    // Init the empty command value.
    this.value = null;

    // Find the element in the selection.
    const { selection } = this.editor.model.document;
    const demoLinkEl = findElement(selection, 'demoLink');
    if (!demoLinkEl) {
      return;
    }

    // Populate command value.
    this.value = {};

    // Process demoLink attributes (demoLinkUrl & demoLinkClass).
    for (const [attrKey, attrValue] of demoLinkEl.getAttributes()) {
      this.value[attrKey] = attrValue;
    }

    // Process demoLink children (demoLinkText & demoLinkFileExtension).
    for (const childNode of demoLinkEl.getChildren()) {
      const childTextNode = childNode.getChild(0);
      const dataNotEmpty = childTextNode && childTextNode._data;
      this.value[childNode.name] = dataNotEmpty ? childTextNode._data : '';
    }
  }

  /**
   * @inheritDoc
   */
  execute(values) {
    const { model } = this.editor;

    model.change((writer) => {

      // If a new button is created or an existing one is being edited.
      var isNew = false;

      // Find an existing demo link if it is being edited.
      var demoLinkEl = findElement(model.document.selection, 'demoLink');

      // Create new demoLink.
      if (!demoLinkEl) {
        demoLinkEl = writer.createElement('demoLink');
        isNew = true;
      }

      // Editing the model element and its children to match the form values.
      this._editElement(writer, demoLinkEl, values);

      // Insert a new button.
      if (isNew) {
        model.insertContent(demoLinkEl);
      }

    });
  }

  /**
   * (Re)create a demoLink element using the new values.
   *
   * While editing, removes child elements, recreates them
   * and appends in a proper order.
   *
   * @param {Writer} writer
   *   Model writer.
   * @param {module:engine/model/element~Element} modelEl
   *   demoLink model element.
   * @param {Array} values
   *   New values.
   *
   * @private
   */
  _editElement(writer, modelEl, values) {

    // Filter out non-attribute values.
    var modelAttrs = Object.fromEntries(
      Object.entries(values).filter(function ([key, value]) {
        return Utils.getDemoLinkModelAttrKeys().includes(key);
      })
    );

    modelAttrs['demoLinkClass'] = 'demo-link';

    // Set modelEl attributes.
    writer.clearAttributes(modelEl);
    writer.setAttributes(modelAttrs, modelEl);

    // Get modelEl children elements names.
    const children = [];
    Array.from(modelEl.getChildren()).forEach((el) => {
      children.push(el.name);
    });

    // Get or create child elements.
    const demoLinkText = this._processChildTextEl(writer, values, children, modelEl, 'demoLinkText');
    const demoLinkFileExtension = this._processChildTextEl(writer, values, children, modelEl, 'demoLinkFileExtension');

    // Append child element in a proper order.
    if (demoLinkText) {
      writer.append(demoLinkText, modelEl);
    }
    if (demoLinkFileExtension) {
      writer.append(demoLinkFileExtension, modelEl);
    }

  }

  /**
   * Processes child text elements.
   *
   * @param {Writer} writer
   *   Model writer.
   * @param {Array} values
   *   New values.
   * @param {Array} children
   *   demoLink child elements names array.
   * @param {module:engine/model/element~Element} modelEl
   *   demoLink model element.
   * @param {string} childElName
   *   Processed child element name.
   *
   * @returns {null|*}
   *   Child element to append to modelEl, or null.
   *
   * @private
   */
  _processChildTextEl(writer, values, children, modelEl, childElName) {

    const childEl = this._processChildElement(
      writer,
      values[childElName],
      children,
      modelEl,
      childElName
    );

    if (childEl) {
      // Remove existing text if any.
      const textNode = childEl.getChild(0);
      if (textNode) {
        writer.remove(textNode);
      }

      // Set new text.
      writer.appendText( values[childElName], childEl );
      return childEl;
    }

    return null;
  }

  /**
   * Processes any child element.
   *
   * @param {Writer} writer
   *   Model writer.
   * @param {string} value
   *   New values.
   * @param {Array} children
   *   demoLink child elements names array.
   * @param {module:engine/model/element~Element} modelEl
   *   demoLink model element.
   * @param {string} childElName
   *   Processed child element name.
   *
   * @returns {null|*}
   *   Child element to append to modelEl, or null.
   *
   * @private
   */
  _processChildElement (writer, value, children, modelEl, childElName) {

    // Define an operation.
    const create = value && !children.includes(childElName);
    const edit = value && children.includes(childElName);
    const remove = !value && children.includes(childElName);

    var childEl = null;

    if (create) {
      childEl = writer.createElement(childElName);
    } else if (edit || remove) {
      // Get updated children list to get the correct index.
      let childrenUpdated = [];
      Array.from(modelEl.getChildren()).forEach((el) => {
        childrenUpdated.push(el.name);
      });

      // Find child element;
      var childElIndex = childrenUpdated.indexOf(childElName);
      childEl = modelEl.getChild(childElIndex);
    }

    // Remove now and re-add later if needed
    // to comply with the child elements order.
    if (children.includes(childElName) && childEl) {
      writer.remove(childEl);
    }

    if (remove) {
      return null;
    } else {
      return childEl;
    }

  }

}
