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
