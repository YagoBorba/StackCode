import { t } from "@stackcode/i18n";
import * as ui from "./commands/ui.js";
import Configstore from "configstore";

const globalConfig = new Configstore("@stackcode/cli");

/**
 * Global state to track if educational mode is enabled
 */
let isEducationalModeEnabled = false;

/**
 * Set the educational mode state
 * @param enabled - Whether educational mode should be enabled
 */
export function setEducationalMode(enabled: boolean): void {
  isEducationalModeEnabled = enabled;
}

/**
 * Initialize educational mode based on global config and command flag
 * @param commandFlag - Whether the --educate flag was passed to the command
 */
export function initEducationalMode(commandFlag: boolean = false): void {
  const globalEducateConfig = globalConfig.get("educate");
  
  // If global config is enabled OR command flag is used, enable educational mode
  isEducationalModeEnabled = globalEducateConfig === "true" || globalEducateConfig === true || commandFlag;
}

/**
 * Get the current educational mode state
 * @returns Whether educational mode is currently enabled
 */
export function isEducationalMode(): boolean {
  return isEducationalModeEnabled;
}

/**
 * Display an educational message if educational mode is enabled
 * @param messageKey - The i18n key for the educational message
 * @param params - Optional parameters for the message
 */
export function showEducationalMessage(
  messageKey: string,
  params?: Record<string, string | number>
): void {
  if (isEducationalModeEnabled) {
    const message = t(messageKey, params);
    // Fallback if translation not found
    if (message === messageKey) {
      const fallbackMessages: Record<string, string> = {
        "educational.gitignore_explanation": "Um arquivo .gitignore está sendo criado para impedir que segredos e arquivos desnecessários sejam salvos no repositório.",
        "educational.readme_explanation": "Um arquivo README.md está sendo criado para documentar seu projeto.",
        "educational.husky_explanation": "Husky está sendo configurado para automatizar verificações antes dos commits.",
        "educational.git_init_explanation": "Inicializando um repositório Git para controle de versão.",
        "educational.scaffold_explanation": "Criando estrutura inicial do projeto baseada no stack selecionado.",
        "educational.commit_validation_explanation": "Commits convencionais ajudam a manter um histórico limpo e permitem automação de releases.",
        "educational.conventional_commits_explanation": "Commits convencionais seguem um padrão que facilita automação. Formato: tipo(escopo): descrição"
      };
      ui.log.info(`💡 ${fallbackMessages[messageKey] || messageKey}`);
    } else {
      ui.log.info(`💡 ${message}`);
    }
  }
}

/**
 * Display a best practice explanation if educational mode is enabled
 * @param messageKey - The i18n key for the best practice message
 * @param params - Optional parameters for the message
 */
export function showBestPractice(
  messageKey: string,
  params?: Record<string, string | number>
): void {
  if (isEducationalModeEnabled) {
    const message = t(messageKey, params);
    // Fallback if translation not found
    if (message === messageKey) {
      const fallbackMessages: Record<string, string> = {
        "educational.commit_validation_explanation": "Commits convencionais ajudam a manter um histórico limpo e permitem automação de releases.",
        "educational.conventional_commits_explanation": "Commits convencionais seguem um padrão que facilita automação. Formato: tipo(escopo): descrição"
      };
      ui.log.step(`📚 ${fallbackMessages[messageKey] || messageKey}`);
    } else {
      ui.log.step(`📚 ${message}`);
    }
  }
}

/**
 * Display a security tip if educational mode is enabled
 * @param messageKey - The i18n key for the security message
 * @param params - Optional parameters for the message
 */
export function showSecurityTip(
  messageKey: string,
  params?: Record<string, string | number>
): void {
  if (isEducationalModeEnabled) {
    ui.log.warning(`🔒 ${t(messageKey, params)}`);
  }
}
