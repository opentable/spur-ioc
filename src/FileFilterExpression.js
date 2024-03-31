/*
The addition of ts (typescript) file registration is only meant to allow the
registration of the file itself. It doesn't guarantee full compilation but it
expects that you have that handled with the use of something like on your end.

TypeScript is not officially supported, but will be available through a
beta/release candidate version.
*/

const expression = /^(?!.*\.d\.ts$)([^.].*)\.(js|json|ts)?$$/;

module.exports = expression;
