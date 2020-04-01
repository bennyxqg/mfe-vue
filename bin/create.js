#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const inquirer = require("inquirer");
const pkg = require("../package.json");

const templatesPath = path.resolve(__dirname, "../templates");

console.log(chalk.green("微前端构建工具(ver:" + pkg.version + ")"));
console.log();

(async () => {
	const dirs = fs.readdirSync(templatesPath);

	const result = await inquirer.prompt([
		{
			name: "projectName",
			type: "input",
			message: "请输入项目名称：",
		},
		{
			name: "template",
			type: "list",
			message: "请选择项目类型：",
			choices: dirs.map(name => {
				return {
					value: name,
				};
			}),
		},
	]);

	const projectName = result.projectName || "project_" + Date.now();
	const template = result.template;

	if (fs.existsSync(projectName)) {
		console.log(chalk.red("创建失败，项目已存在！"));
		process.exit(1);
	}

	const templateRoot = templatesPath + "/" + template;
	const files = fs.readdirSync(templateRoot);

	files.forEach(file => {
		if (file == "dist" || file == "node_modules") {
			return;
		}

		fs.copySync(`${templateRoot}/${file}`, `${projectName}/${file}`);
	});

	const pkg = require(`${process.cwd()}/${projectName}/package.json`);
	pkg.name = projectName;
	pkg.main = "./src/index.js";

	fs.writeFileSync(`${projectName}/package.json`, JSON.stringify(pkg, null, 2));

	console.log();
	console.log(chalk.green("项目初始化完成"));
	console.log();
	console.log(
		`请进入 ${chalk.green(projectName)} 项目，执行 ${chalk.green(
			"npm install"
		)} 安装项目依赖...`
	);
})();
