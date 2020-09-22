import isArray from "lodash/isArray";
import isBoolean from "lodash/isBoolean";
import isEmpty from "lodash/isEmpty";
import isNull from "lodash/isNull";
import isNumber from "lodash/isNumber";
import isPlainObject from "lodash/isPlainObject";
import isString from "lodash/isString";
export default {
  methods: {
    flattenObject(o, prefix = "", result = {}, keepNull = true) {
      if (
        isString(o) ||
        isNumber(o) ||
        isBoolean(o) ||
        (keepNull && isNull(o))
      ) {
        result[prefix] = o;
        return result;
      }

      if (isArray(o) || isPlainObject(o)) {
        for (let i in o) {
          let pref = prefix;
          if (isArray(o)) {
            pref = pref + `[${i}]`;
          } else {
            if (isEmpty(prefix)) {
              pref = i;
            } else {
              pref = prefix + "." + i;
            }
          }
          this.flattenObject(o[i], pref, result, keepNull);
        }
        return result;
      }
      return result;
    }
  }
};
