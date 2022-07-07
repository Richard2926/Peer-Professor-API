"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = __importDefault(require("firebase-admin"));
exports.admin = firebase_admin_1.default;
const storage_1 = require("firebase-admin/storage");
const service_account = __importStar(require("./firebaseServiceAccount.json"));
const serviceAccount = {
    type: "service_account",
    project_id: "homework-hangover-340901",
    private_key_id: "ad45eb6c1512a566225f4caabe7d1a63c221cd08",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC6H1ohk3k+KvG4\nMx+FORwPT6AdsvaTb/36KgEhbARaxOetCWJK6nAahfEXIyvHhRA7vnto2DAjPOyU\nJKxeofpptc7NUOVu33ChI04dh37dgpKx8RdnV8oPjWdl/FTYpHCA/bltok3LCtaS\n/ig5hws+37YGjDQKPeTo8LnR+BBgKJPM7bTlPIqRUs1HBlDJgAwSHmowshRVuZQl\noBLIE7Wbn0rxO0CehDdqNZTO9wffGUEl1XT8HQY8/IuWKH55qE/xR++Hg8+214G3\nMAm5K50SaN3H6sIr2ei59I8XvzqihG89BDB0B1NX1W8wOyv6G1b49hrSXoOt5bZH\nmIprT9kDAgMBAAECggEANOFLflakD+Gro6YCwpsjOcZpu4ZpQCKFiln80D4cTp27\nJRKRdq99Akwj32sCuUE5B4BrF7K0mo5ouP5iatCikP4yr2rYhNO+8ElTnFgu10iN\n3TieaaIrqpeGVReIE7VEsaFk2Z1PdOyzYjgLvax8qXRuBxY2guJq8zPR17IfFPJ1\nYmyfHjb8+7IZJTy/NIn3/iOwfebjM8PWtHwr/02xayK2nyvd+SFFgNmlt8H2Brrg\nAXk9pI3wVZT4U+SteLdJFwAkJQZ3/4czwNuMW0vWm7ScLgKswkS5VMIHmiknNsxT\nao6msFtpvzir5b4t3/Lv1kIJpCOElexZOoRLdcluQQKBgQD30Jvvv5ZEhS4podDZ\nduia4erOyPMpbhAuI42qVXNL41P+rk7QTVIIfNxjdILGLb2BsD9SbxMeoa6QWPMZ\nxbG8+La1w258Uw5QnptQcnGJzIIUyFZiaC5sn+DI+bH0zCRVcsJU2ODsRQDf5dR3\nVERhxS3K8+axnVEORyMtRv0UewKBgQDARRrPLA4PPGLTnBvVIDNKI/9FXyzWMMNE\nWNBaUkQ7ZyzcmK5VhWV1BCC7pUBRMRk4xc52LE8TY5O+Sw2rIcbshpn7RqjcvSnF\nsNDQ8JpDH+k03J5mZ90KWkPHfVjfG6zJraGyQ4PBLGyv3oc2dfuyejRuzRLlPPLR\nl+SJKfm7GQKBgGHl1VR3GUPkYQItXLYsFWPqT7p1BCqfwmCXxwU9UJjwK2R3M8dy\nZC/aM65OfsMPmse6+qj0HFeDg9SebxsFUFvY3UUc+W6/2O3cWnsDWvsXAWR4aDfj\n9EMRPdnnWnfclZX0CfU+4Ew2TkwlHTQu4/zDyn1csQwFm9nKHIlse9o1AoGBAJVX\n1/gdtxn8hKLree70oQIwrcJbp/8DR1kaR1Qw3FDr1jvO2HMTN3hJ6Yb3V9r48SdY\n9gJybkWYLhU8RPStOs9Tyd0UyGsU/5JPwhLZIGmNKt5lkx/mAxpcfJNCeLpry62n\nkZZevMNaV13P0mTqBcRfCcUaw1eOHOnSOrCUCydZAoGBALuNcGyAfW5Q0Dn2+kX0\niXttIczZ2ENG34GqvMl21PX/EFtRGFwjPSv1Uf8Cum0MD08OzyJL/4qIzERHALrd\nCZsXE9fON7/2AQHm6IJZ1VmFkW+jJvVzTHSTl7yg5tevzOnprs28VZDxGXi5aHDw\nK/LgBAYo17U5/C9RsyhSqrAS\n-----END PRIVATE KEY-----\n",
    client_email: "firebase-adminsdk-8kc70@homework-hangover-340901.iam.gserviceaccount.com",
    client_id: "112041888447329976928",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-8kc70%40homework-hangover-340901.iam.gserviceaccount.com",
};
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(service_account),
    storageBucket: "homework-hangover-340901.appspot.com",
});
const bucket = storage_1.getStorage().bucket();
exports.bucket = bucket;
//# sourceMappingURL=firebase.js.map