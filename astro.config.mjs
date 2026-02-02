// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightLinksValidator from "starlight-links-validator";
import remarkStripMdLinks from "./remark-strip-md-links.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://fieldnotes.tenderisthebyte.com/",
  markdown: {
    remarkPlugins: [remarkStripMdLinks],
  },
  integrations: [
    starlight({
      title: "Field Notes",
      plugins: [starlightLinksValidator()],
      components: {
        Footer: "./src/components/Footer.astro",
      },
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
