// prebuild entry for content validation. On Vercel the content was already validated locally before push
// (full engine runs are slow there and the validator imports .ts files, which needs Node 24 type stripping),
// so skip unless FORCE_VALIDATE is set. Locally this runs the full validator.
if (process.env.VERCEL && !process.env.FORCE_VALIDATE) {
  console.log('validate-content: skipped on Vercel (run `npm run validate` locally before pushing)');
} else {
  await import('./validate-content.mjs');
}
