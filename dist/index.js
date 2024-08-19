#!/usr/bin/env node
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Command } from "commander";
import chalk from "chalk";
import simpleGit from "simple-git";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import inquirer from "inquirer";
import { platform } from "os";
const program = new Command();
const TEMPLATE = "https://github.com/Addcodee/Quick-Starter.git";
program
    .name("qk")
    .description("CLI для создания проектов на основе моего шаблона")
    .version("1.0.0");
program
    .command("create <project-name>")
    .description("Создать новый проект")
    .action((projectName) => __awaiter(void 0, void 0, void 0, function* () {
    const projectPath = path.join(process.cwd(), projectName);
    if (fs.existsSync(projectPath)) {
        console.error(chalk.red("Папка с таким именем уже существует!"));
        process.exit(1);
    }
    console.log(chalk.green("Клонирую шаблон..."));
    const git = simpleGit();
    try {
        yield git.clone(TEMPLATE, projectPath);
        console.log(chalk.green("Шаблон успешно клонирован."));
        process.chdir(projectPath);
        // Определяем платформу
        const isWindows = platform() === "win32";
        // Удаление старой истории git
        if (isWindows) {
            execSync("rmdir /s /q .git"); // Команда для Windows
        }
        else {
            execSync("rm -rf .git"); // Команда для Unix/Linux/Mac
        }
        execSync("git init");
        const questions = [
            {
                type: "list",
                name: "packageManager",
                message: "Выберите пакетный менеджер для установки зависимостей:",
                choices: ["npm", "yarn", "pnpm"],
            },
        ];
        const { packageManager } = yield inquirer.prompt(questions);
        // Удаление ненужных lock-файлов
        if (packageManager === "npm") {
            if (fs.existsSync("yarn.lock")) {
                fs.unlinkSync("yarn.lock");
            }
            if (fs.existsSync("pnpm-lock.yaml")) {
                fs.unlinkSync("pnpm-lock.yaml");
            }
            execSync("npm install", { stdio: "inherit" });
        }
        else if (packageManager === "yarn") {
            if (fs.existsSync("package-lock.json")) {
                fs.unlinkSync("package-lock.json");
            }
            if (fs.existsSync("pnpm-lock.yaml")) {
                fs.unlinkSync("pnpm-lock.yaml");
            }
            execSync("yarn install", { stdio: "inherit" });
        }
        else if (packageManager === "pnpm") {
            if (fs.existsSync("package-lock.json")) {
                fs.unlinkSync("package-lock.json");
            }
            if (fs.existsSync("yarn.lock")) {
                fs.unlinkSync("yarn.lock");
            }
            execSync("pnpm install", { stdio: "inherit" });
        }
        console.log(chalk.green("Проект успешно создан!"));
    }
    catch (err) {
        console.error(chalk.red("Ошибка клонирования репозитория:", err));
    }
}));
program.parse(process.argv);
