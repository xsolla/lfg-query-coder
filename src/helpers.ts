export function deepAssign<T extends Record<any, any>>(
  obj: T,
  path: string,
  value: any
): Record<any, any> {
  const pathArray = path.split(".") as Array<keyof T>;
  let copyObj = obj;

  while (pathArray.length - 1) {
    const accessibleNode = pathArray.shift();
    if (!accessibleNode) {
      return copyObj;
    }

    if (!(accessibleNode in copyObj)) {
      copyObj[accessibleNode] = {} as any;
    }
    copyObj = copyObj[accessibleNode];
  }

  copyObj[pathArray[0]] = value;

  return copyObj;
}
