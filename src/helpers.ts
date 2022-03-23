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

export function deepMatch(
  sample: Record<any, any>,
  obj: Record<any, any>
): boolean {
  return Object.keys(sample).every((key) => {
    const sampleValue = sample[key];
    const objValue = obj[key];

    if ((sampleValue && !objValue) || typeof sampleValue !== typeof objValue) {
      return false;
    }

    if (isObject(sampleValue)) {
      return deepMatch(sampleValue, objValue);
    }

    return sampleValue === objValue;
  });
}

export function isObject<T>(node: T): node is Record<any, any> {
  return typeof node === "object" && Boolean(node);
}
