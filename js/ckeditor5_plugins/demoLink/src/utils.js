/**
 * @file
 * Defines a helper class and functions.
 */

/**
 * Finds a closest element of a model name in a given selection.
 *
 * @param {module:engine/model/selection~Selection} modelSelection
 *   Model selection.
 *
 * @param {string} modelName
 *   Model name of a searched element.
 *
 * @returns {module:engine/model/element~Element}
 *   Found element.
 */
export function findElement(modelSelection, modelName) {
  const selectedElement = modelSelection.getSelectedElement();
  if (selectedElement && selectedElement.name == modelName) {
    return selectedElement;
  } else {
    return modelSelection
      .getFirstRange()
      .getCommonAncestor()
      .findAncestor(modelName);
  }
}

/**
 * A helper class.
 *
 * Defines model elements and attributes used in the {@link module:demoLink/demoLink~DemoLink plugin}.
 */
class Utils {

  /**
   * Model attributes corresponding to HTML attributes.
   */
  static htmlAttrs = {
    'demoLinkUrl': 'href',
    // 'demoLinkClass': 'class',
  };

  /**
   * Model element to form element mapping.
   *
   * Maps a model element to a respective form element
   * in the {@link module:demoLink/ui/DemoLinkFormView~FormView}
   *
   */
  static modelToFormFieldMapping = {
    demoLinkText: 'textInputView',
    demoLinkFileExtension: 'fileExtensionInputView',
    demoLinkUrl: 'urlInputView',
  };

  /**
   * Gets model element to form element mapping.
   */
  static getModelToInputFormFieldsMapping() {
    return this.modelToFormFieldMapping;
  }

  /**
   * Gets demoLink model attributes keys.
   *
   * @returns {string[]}
   *   Array of model attributes names.
   */
  static getDemoLinkModelAttrKeys() {
    return Object.keys(this.htmlAttrs);
  }

}

export {
  Utils,
}
