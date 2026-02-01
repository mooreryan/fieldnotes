// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightLinksValidator from "starlight-links-validator";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Field Notes",
      plugins: [starlightLinksValidator()],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/mooreryan/fieldnotes",
        },
      ],
      sidebar: [
        {
          label: "Gleam",
          autogenerate: { directory: "gleam" },
        },
        {
          label: "Uncategorized",
          autogenerate: { directory: "uncategorized" },
        },
      ],
      pagination: false,
    }),
  ],
});
