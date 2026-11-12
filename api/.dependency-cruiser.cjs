/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      comment: "No circular dependencies between modules.",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    {
      name: "controllers-no-dao-or-orm",
      comment:
        "Controllers must go through a Service — never call a DAO or TypeORM directly.",
      severity: "error",
      from: { path: "^src/.+/controllers/" },
      to: { path: "(^src/.+/daos/|[\\\\/]node_modules[\\\\/]typeorm)" },
    },
    {
      name: "routes-only-controllers",
      comment:
        "Routes wire up controllers; they must not reach into services or daos directly.",
      severity: "error",
      from: { path: "^src/.+/routes/" },
      to: { path: "(^src/.+/services/|^src/.+/daos/)" },
    },
    {
      name: "daos-no-upward-deps",
      comment: "DAOs are the bottom layer — they must not import controllers or services.",
      severity: "error",
      from: { path: "^src/.+/daos/" },
      to: { path: "(^src/.+/controllers/|^src/.+/services/)" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
  },
};
