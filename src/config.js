export const HTTP_PROTOCOL = process.env.HTTP_PROTOCOL;
export const API_HOST = process.env.API_HOST;
export const API_URI = `${HTTP_PROTOCOL}://${API_HOST}/parse/classes`;
export const YELP_HOST_URI = `${HTTP_PROTOCOL}://${process.env.YELP_HOST}/yelp`;
export const GOOGLE_HOST_URI = `${HTTP_PROTOCOL}://${process.env.YELP_HOST}/google`;
export const UPLOAD_HOST = `${HTTP_PROTOCOL}://${process.env.UPLOAD_HOST}`;
export const UPLOAD_HOST_URI = `${UPLOAD_HOST}/upload`;

export const PARSE_APPLICATION_ID = process.env.PARSE_APPLICATION_ID;
export const PARSE_MASTER_KEY = process.env.PARSE_MASTER_KEY;
export const GOOGLE_MAP_API_KEY = process.env.GOOGLE_MAP_API_KEY;

export const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
export const API_URI_BATCH = `${HTTP_PROTOCOL}://${API_HOST}/parse/batch`;