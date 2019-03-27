export default function wizard(steps, project) {
  return steps.find(({ conditions }, index, array) => {
    // Return this step if it's the last.
    // This means all other steps' conditions were met, indicating
    // all other steps are complete
    if (index === (array.length - 1)) return true;

    const attributeKeys = Object.keys(conditions);
    const currentAttributes = project.getProperties(...attributeKeys);

    // return this step if ANY attributes have unmet conditions
    return attributeKeys.any((attr) => {
      const currentCondition = currentAttributes[attr];
      // make project conditionalChecks's 'this'
      const conditionalCheck = (conditions[attr]).bind(project, currentCondition, attr);
      const generatedValue = !conditionalCheck();

      return generatedValue;
    });
  });
}
