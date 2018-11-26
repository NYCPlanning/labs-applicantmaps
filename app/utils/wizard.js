export default function wizard(steps, project) {
  return steps.find(({ conditions }, index, array) => {
    // return this step if it's the last
    if (index === (array.length - 1)) return true;

    const attributeKeys = Object.keys(conditions);
    const currentAttributes = project.getProperties(...attributeKeys);

    // return this step if ANY attributes have unmet conditions
    return attributeKeys.any((attr) => {
      const currentCondition = currentAttributes[attr];
      // make project conditionalChecks's 'this'
      // console.log(currentCondition);
      const conditionalCheck = (conditions[attr]).bind(project, currentCondition);
      const generatedValue = !conditionalCheck();

      return generatedValue;
    });
  });
}
