import fs from "fs";
import path from "path";

const FALLBACK_THUMBNAIL = "/static/placeholder.png";

export type Lesson = {
  id: string;
  name: string;
  order: number;
  type: "html" | "video";
  htmlContent?: string;
  videoUrl?: string;
  completed?: boolean; // Optional, used for tracking completion
};

export type Module = {
  id: string;
  name: string;
  order: number;
  isExtra: boolean;
  lessons: Lesson[];
};

export type ModulePreview = Omit<Module, "lessons">;

export type Product = {
  id: string;
  name: string;
  thumbnail?: string;
  modules: Module[];
  cssContent?: string; // Optional, contains CSS from product folder if present
};

export type ProductPreview = Omit<Product, "modules"> & {
  modules: ModulePreview[];
};

function extractOrder(name: string): number {
  const [prefix] = name.split("-");
  const n = parseInt(prefix, 10);
  return isNaN(n) ? 0 : n;
}

function parseNames(productPath: string): Record<string, string> {
  const namesPath = path.join(productPath, "names.txt");
  if (!fs.existsSync(namesPath)) return {};
  const lines = fs.readFileSync(namesPath, "utf8").split("\n");
  const names: Record<string, string> = {};
  for (const line of lines) {
    if (!line.trim() || !line.includes("=")) continue;
    const [id, ...rest] = line.split("=");
    names[id.trim()] = rest.join("=").trim();
  }
  return names;
}

function getThumbnailFromNames(names: Record<string, string>): string {
  const thumbnail = names["thumbnail"];
  if (!thumbnail) return FALLBACK_THUMBNAIL;
  const publicPath = path.join(process.cwd(), "public", thumbnail);
  return fs.existsSync(publicPath) ? thumbnail : FALLBACK_THUMBNAIL;
}

function getModuleList(productPath: string) {
  return fs
    .readdirSync(productPath)
    .filter((name) => fs.statSync(path.join(productPath, name)).isDirectory())
    .map((moduleId) => ({
      id: moduleId,
      order: extractOrder(moduleId),
      isExtra: moduleId.toLowerCase().includes("extra"),
    }))
    .sort((a, b) => a.order - b.order);
}

function getLessons(
  modulePath: string,
  moduleId: string,
  names: Record<string, string>,
  lockedHtmlContent?: string
): Lesson[] {
  const files = fs.readdirSync(modulePath);
  const lessonIds = Array.from(
    new Set(
      files
        .filter((f) => f.endsWith(".html") || f.endsWith(".video"))
        .map((f) => f.replace(/\.html$|\.video$/, ""))
    )
  );
  return lessonIds
    .map((lessonId) => {
      const htmlFile = files.find((f) => f === `${lessonId}.html`);
      const videoFile = files.find((f) => f === `${lessonId}.video`);
      const order = extractOrder(lessonId);
      const name = names[`${moduleId}/${lessonId}`] || lessonId;
      const uniqueLessonId = `${moduleId}/${lessonId}`;

      if (videoFile) {
        let videoUrl = fs
          .readFileSync(path.join(modulePath, videoFile), "utf8")
          .trim();
        // Ensure the URL is in /embed/ format for iframe embedding
        if (videoUrl.includes('/play/')) {
          videoUrl = videoUrl.replace('/play/', '/embed/');
        }
        return {
          id: uniqueLessonId,
          name,
          order,
          type: "video" as const,
          videoUrl,
        };
      } else if (htmlFile) {
        const htmlContent =
          lockedHtmlContent !== undefined
            ? lockedHtmlContent
            : fs.readFileSync(path.join(modulePath, htmlFile), "utf8");
        return {
          id: uniqueLessonId,
          name,
          order,
          type: "html" as const,
          htmlContent,
        };
      } else {
        return {
          id: uniqueLessonId,
          name,
          order,
          type: "html" as const,
          htmlContent: lockedHtmlContent ?? "",
        };
      }
    })
    .sort((a, b) => a.order - b.order);
}

// Helper to get the first CSS file content in a product folder
function getProductCssContent(productPath: string): string | undefined {
  const files = fs.readdirSync(productPath);
  const cssFile = files.find((f) => f.endsWith(".css"));
  if (cssFile) {
    return fs.readFileSync(path.join(productPath, cssFile), "utf8");
  }
  return undefined;
}

// 1. Load full product (all modules and lessons)
export function loadFullProduct(
  productsPath: string,
  productId: string
): Product | null {
  const productPath = path.join(productsPath, productId);
  if (!fs.existsSync(productPath)) return null;
  const names = parseNames(productPath);
  const productName = names["product"] || productId;
  const thumbnail = getThumbnailFromNames(names); // Now just the public path
  const cssContent = getProductCssContent(productPath);

  const modules = getModuleList(productPath).map(
    ({ id: moduleId, order, isExtra }) => {
      const modulePath = path.join(productPath, moduleId);
      const lessons = getLessons(modulePath, moduleId, names);
      return {
        id: moduleId,
        name: names[moduleId] || moduleId,
        order,
        isExtra,
        lessons,
      };
    }
  );

  return {
    id: productId,
    name: productName,
    thumbnail,
    modules,
    cssContent,
  };
}

// 2. Load restricted product (extra modules have only a locked message)
export function loadRestrictedProduct(
  productsPath: string,
  productId: string
): Product | null {
  const productPath = path.join(productsPath, productId);
  if (!fs.existsSync(productPath)) return null;
  const names = parseNames(productPath);
  const productName = names["product"] || productId;
  const thumbnail = getThumbnailFromNames(names); // Now just the public path
  const cssContent = getProductCssContent(productPath);

  const lockedHtml = `<h2>Os módulos extras ficam disponíveis 7 dias após a compra</h2>`;

  const modules = getModuleList(productPath).map(
    ({ id: moduleId, order, isExtra }) => {
      const modulePath = path.join(productPath, moduleId);
      const lessons = isExtra
        ? getLessons(modulePath, moduleId, names, lockedHtml)
        : getLessons(modulePath, moduleId, names);
      return {
        id: moduleId,
        name: names[moduleId] || moduleId,
        order,
        isExtra,
        lessons,
      };
    }
  );

  return {
    id: productId,
    name: productName,
    thumbnail,
    modules,
    cssContent,
  };
}

// 3. Load product preview (no lessons)
export function loadProductPreview(
  productsPath: string,
  productId: string
): ProductPreview | null {
  const productPath = path.join(productsPath, productId);
  if (!fs.existsSync(productPath)) return null;
  const names = parseNames(productPath);
  const productName = names["product"] || productId;
  const thumbnail = getThumbnailFromNames(names);

  const modules: ModulePreview[] = getModuleList(productPath).map(
    ({ id: moduleId, order, isExtra }) => ({
      id: moduleId,
      name: names[moduleId] || moduleId,
      order,
      isExtra,
    })
  );

  return {
    id: productId,
    name: productName,
    thumbnail,
    modules,
  };
}
