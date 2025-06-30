import eslint from "@eslint/js";
import tslint from "typescript-eslint";

import stylistic from "@stylistic/eslint-plugin";

import prettier from "eslint-config-prettier";

export default tslint.config(
	{ files: ["src/**/*.ts"] },
	{ ignores: ["test/**", "docs/**", "*.config.mjs"] },

	eslint.configs.recommended,
	tslint.configs.eslintRecommended,

	{
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	tslint.configs.strictTypeChecked,
	tslint.configs.stylisticTypeChecked,

	stylistic.configs.recommended,

	prettier,
);
