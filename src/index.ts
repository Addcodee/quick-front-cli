#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import simpleGit from "simple-git";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import inquirer from "inquirer";
import { platform } from "os";
import pkg from "../package.json" assert { type: "json" };

const program = new Command();

const TEMPLATE = process.env.TEMPLATE;

program
	.name("qk")
	.description("CLI для создания проектов на основе моего шаблона")
	.version(pkg.version);

program
	.command("create <project-name>")
	.description("Создать новый проект")
	.action(async (projectName: string) => {
		const projectPath = path.join(process.cwd(), projectName);

		if (fs.existsSync(projectPath)) {
			console.error(chalk.red("Папка с таким именем уже существует!"));
			process.exit(1);
		}

		console.log(chalk.green("Клонирую шаблон..."));

		const git = simpleGit();
		try {
			await git.clone(TEMPLATE as string, projectPath);
			console.log(chalk.green("Шаблон успешно клонирован."));

			process.chdir(projectPath);

			// Определяем платформу
			const isWindows = platform() === "win32";

			// Удаление старой истории git
			if (isWindows) {
				execSync("rmdir /s /q .git"); // Команда для Windows
			} else {
				execSync("rm -rf .git"); // Команда для Unix/Linux/Mac
			}

			execSync("git init");

			const questions: any = [
				{
					type: "list",
					name: "packageManager",
					message: "Выберите пакетный менеджер для установки зависимостей:",
					choices: ["npm", "yarn", "pnpm"],
				},
			];

			const { packageManager } = await inquirer.prompt(questions);

			// Удаление ненужных lock-файлов
			if (packageManager === "npm") {
				if (fs.existsSync("yarn.lock")) {
					fs.unlinkSync("yarn.lock");
				}
				if (fs.existsSync("pnpm-lock.yaml")) {
					fs.unlinkSync("pnpm-lock.yaml");
				}
				execSync("npm install", { stdio: "inherit" });
			} else if (packageManager === "yarn") {
				if (fs.existsSync("package-lock.json")) {
					fs.unlinkSync("package-lock.json");
				}
				if (fs.existsSync("pnpm-lock.yaml")) {
					fs.unlinkSync("pnpm-lock.yaml");
				}
				execSync("yarn install", { stdio: "inherit" });
			} else if (packageManager === "pnpm") {
				if (fs.existsSync("package-lock.json")) {
					fs.unlinkSync("package-lock.json");
				}
				if (fs.existsSync("yarn.lock")) {
					fs.unlinkSync("yarn.lock");
				}
				execSync("pnpm install", { stdio: "inherit" });
			}

			console.log(chalk.green("Проект успешно создан!"));
		} catch (err) {
			console.error(chalk.red("Ошибка клонирования репозитория:", err));
		}
	});

program.parse(process.argv);
