export const tryParseJSONObject = (jsonString: string | undefined) => {
  try {
    var o = JSON.parse(jsonString);
    if (o && typeof o === 'object') {
      return o;
    }
  } catch (e) {}

  return false;
};
