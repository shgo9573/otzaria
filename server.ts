import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Storage directory for Otzaria dataset
const STORAGE_DIR = path.join(__dirname, 'data', 'otzaria_library');
const CATALOG_FILE = path.join(STORAGE_DIR, 'catalog.json');
const BOOKS_DIR = path.join(STORAGE_DIR, 'books');

// Interface types
export interface TocNode {
  title: String;
  index: number;
  children?: TocNode[];
}

export interface BookItem {
  id: number;
  title: string;
  categoryPath: string;
  author?: string;
  heCategories?: string;
  heEra?: string;
  fileType: string; // 'txt' | 'pdf' | 'docx'
  order?: number;
  hasToc?: boolean;
  hasLinks?: boolean;
}

export interface CategoryNode {
  id: string;
  name: string;
  path: string;
  children?: CategoryNode[];
  books?: BookItem[];
}

interface ServerState {
  status: 'initializing' | 'downloading' | 'ready' | 'error';
  progress: number; // 0 to 100
  downloadedBytes: number;
  totalBooks: number;
  storageUsageMB: number;
  lastUpdated: string;
}

let serverState: ServerState = {
  status: 'initializing',
  progress: 0,
  downloadedBytes: 0,
  totalBooks: 0,
  storageUsageMB: 0,
  lastUpdated: new Date().toISOString()
};

// Ensure storage directories exist
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}
if (!fs.existsSync(BOOKS_DIR)) {
  fs.mkdirSync(BOOKS_DIR, { recursive: true });
}

// Generate canonical Otzaria catalog data
function createDefaultCatalog(): { categories: CategoryNode[]; books: BookItem[] } {
  const books: BookItem[] = [
    // תנ"ך
    { id: 101, title: 'בראשית', categoryPath: 'תנ"ך/תורה', author: 'משה רבינו', heCategories: 'תנ"ך, תורה', heEra: 'מקרא', fileType: 'txt', order: 1, hasToc: true, hasLinks: true },
    { id: 102, title: 'שמות', categoryPath: 'תנ"ך/תורה', author: 'משה רבינו', heCategories: 'תנ"ך, תורה', heEra: 'מקרא', fileType: 'txt', order: 2, hasToc: true, hasLinks: true },
    { id: 103, title: 'ויקרא', categoryPath: 'תנ"ך/תורה', author: 'משה רבינו', heCategories: 'תנ"ך, תורה', heEra: 'מקרא', fileType: 'txt', order: 3, hasToc: true, hasLinks: true },
    { id: 104, title: 'במדבר', categoryPath: 'תנ"ך/תורה', author: 'משה רבינו', heCategories: 'תנ"ך, תורה', heEra: 'מקרא', fileType: 'txt', order: 4, hasToc: true, hasLinks: true },
    { id: 105, title: 'דברים', categoryPath: 'תנ"ך/תורה', author: 'משה רבינו', heCategories: 'תנ"ך, תורה', heEra: 'מקרא', fileType: 'txt', order: 5, hasToc: true, hasLinks: true },
    { id: 106, title: 'יהושע', categoryPath: 'תנ"ך/נביאים/נביאים ראשונים', author: 'יהושע בן נון', heCategories: 'תנ"ך, נביאים', heEra: 'מקרא', fileType: 'txt', order: 6, hasToc: true, hasLinks: true },
    { id: 107, title: 'שופטים', categoryPath: 'תנ"ך/נביאים/נביאים ראשונים', author: 'שמואל הנביא', heCategories: 'תנ"ך, נביאים', heEra: 'מקרא', fileType: 'txt', order: 7, hasToc: true, hasLinks: true },
    { id: 108, title: 'שמואל א', categoryPath: 'תנ"ך/נביאים/נביאים ראשונים', author: 'שמואל, גד ונתן', heCategories: 'תנ"ך, נביאים', heEra: 'מקרא', fileType: 'txt', order: 8, hasToc: true, hasLinks: true },
    { id: 109, title: 'ישעיהו', categoryPath: 'תנ"ך/נביאים/נביאים אחרונים', author: 'ישעיהו הנביא', heCategories: 'תנ"ך, נביאים', heEra: 'מקרא', fileType: 'txt', order: 9, hasToc: true, hasLinks: true },
    { id: 110, title: 'תהילים', categoryPath: 'תנ"ך/כתובים', author: 'דוד המלך', heCategories: 'תנ"ך, כתובים', heEra: 'מקרא', fileType: 'txt', order: 10, hasToc: true, hasLinks: true },
    { id: 111, title: 'משלי', categoryPath: 'תנ"ך/כתובים', author: 'שלמה המלך', heCategories: 'תנ"ך, כתובים', heEra: 'מקרא', fileType: 'txt', order: 11, hasToc: true, hasLinks: true },
    { id: 112, title: 'איוב', categoryPath: 'תנ"ך/כתובים', author: 'משה רבינו', heCategories: 'תנ"ך, כתובים', heEra: 'מקרא', fileType: 'txt', order: 12, hasToc: true, hasLinks: true },
    { id: 113, title: 'שיר השירים', categoryPath: 'תנ"ך/כתובים/חמש מגילות', author: 'שלמה המלך', heCategories: 'תנ"ך, חמש מגילות', heEra: 'מקרא', fileType: 'txt', order: 13, hasToc: true, hasLinks: true },

    // משנה
    { id: 201, title: 'משנה ברכות', categoryPath: 'משנה/סדר זרעים', author: 'רבי יהודה הנשיא', heCategories: 'משנה, זרעים', heEra: 'תנאים', fileType: 'txt', order: 1, hasToc: true, hasLinks: true },
    { id: 202, title: 'משנה שבת', categoryPath: 'משנה/סדר מועד', author: 'רבי יהודה הנשיא', heCategories: 'משנה, מועד', heEra: 'תנאים', fileType: 'txt', order: 2, hasToc: true, hasLinks: true },
    { id: 203, title: 'משנה אבות', categoryPath: 'משנה/סדר נזיקין', author: 'חכמי המשנה', heCategories: 'משנה, נזיקין', heEra: 'תנאים', fileType: 'txt', order: 3, hasToc: true, hasLinks: true },

    // גמרא
    { id: 301, title: 'תלמוד בבלי ברכות', categoryPath: 'גמרא/תלמוד בבלי/סדר זרעים', author: 'רב אשי ורבינא', heCategories: 'גמרא, תלמוד בבלי', heEra: 'אמוראים', fileType: 'txt', order: 1, hasToc: true, hasLinks: true },
    { id: 302, title: 'תלמוד בבלי שבת', categoryPath: 'גמרא/תלמוד בבלי/סדר מועד', author: 'רב אשי ורבינא', heCategories: 'גמרא, תלמוד בבלי', heEra: 'אמוראים', fileType: 'txt', order: 2, hasToc: true, hasLinks: true },
    { id: 303, title: 'תלמוד בבלי סנהדרין', categoryPath: 'גמרא/תלמוד בבלי/סדר נזיקין', author: 'רב אשי ורבינא', heCategories: 'גמרא, תלמוד בבלי', heEra: 'אמוראים', fileType: 'txt', order: 3, hasToc: true, hasLinks: true },

    // מדרש
    { id: 401, title: 'מדרש רבה בראשית', categoryPath: 'מדרש/מדרש רבה', author: 'רבי הושעיה רבה', heCategories: 'מדרש, מדרש רבה', heEra: 'אמוראים', fileType: 'txt', order: 1, hasToc: true, hasLinks: true },
    { id: 402, title: 'מדרש תנחומא בראשית', categoryPath: 'מדרש/תנחומא', author: 'רבי תנחומא', heCategories: 'מדרש', heEra: 'אמוראים', fileType: 'txt', order: 2, hasToc: true, hasLinks: true },

    // הלכה
    { id: 501, title: 'משנה תורה הלכות יסודי התורה', categoryPath: 'הלכה/רמב"ם/ספר המדע', author: 'רבנו משה בן מימון (רמב"ם)', heCategories: 'הלכה, רמב"ם', heEra: 'ראשונים', fileType: 'txt', order: 1, hasToc: true, hasLinks: true },
    { id: 502, title: 'משנה תורה הלכות שבת', categoryPath: 'הלכה/רמב"ם/ספר זמנים', author: 'רבנו משה בן מימון (רמב"ם)', heCategories: 'הלכה, רמב"ם', heEra: 'ראשונים', fileType: 'txt', order: 2, hasToc: true, hasLinks: true },
    { id: 503, title: 'שולחן ערוך אורח חיים', categoryPath: 'הלכה/שולחן ערוך', author: 'רבי יוסף קארו', heCategories: 'הלכה, שולחן ערוך', heEra: 'אחרונים', fileType: 'txt', order: 3, hasToc: true, hasLinks: true },
    { id: 504, title: 'משנה ברורה אורח חיים', categoryPath: 'הלכה/נושאי כלי שולחן ערוך/משנה ברורה', author: 'רבי ישראל מאיר הכהן (החפץ חיים)', heCategories: 'הלכה, משנה ברורה', heEra: 'אחרונים', fileType: 'txt', order: 4, hasToc: true, hasLinks: true },

    // חסידות
    { id: 601, title: 'תניא - ליקוטי אמרים', categoryPath: 'חסידות/חב"ד', author: 'רבי שניאור זלמן מליאדי (בעל התניא)', heCategories: 'חסידות, חב"ד', heEra: 'אחרונים', fileType: 'txt', order: 1, hasToc: true, hasLinks: true },
    { id: 602, title: 'ליקוטי מוהר"ן', categoryPath: 'חסידות/ברסלב', author: 'רבי נחמן מברסלב', heCategories: 'חסידות, ברסלב', heEra: 'אחרונים', fileType: 'txt', order: 2, hasToc: true, hasLinks: true },
    { id: 603, title: 'קדושת לוי', categoryPath: 'חסידות/כללי', author: 'רבי לוי יצחק מברדיטשוב', heCategories: 'חסידות', heEra: 'אחרונים', fileType: 'txt', order: 3, hasToc: true, hasLinks: true },

    // קבלה
    { id: 701, title: 'ספר הזוהר - בראשית', categoryPath: 'קבלה/זוהר', author: 'רבי שמעון בן יוחאי', heCategories: 'קבלה, זוהר', heEra: 'תנאים', fileType: 'txt', order: 1, hasToc: true, hasLinks: true },
    { id: 702, title: 'עץ חיים', categoryPath: 'קבלה/כתבי האר"י', author: 'רבי חיים ויטאל', heCategories: 'קבלה, האר"י', heEra: 'אחרונים', fileType: 'txt', order: 2, hasToc: true, hasLinks: true },

    // מחשבה ומוסר
    { id: 801, title: 'מסילת ישרים', categoryPath: 'מחשבה ומוסר/ספרי מוסר', author: 'רבי משה חיים לוצאטו (רמח"ל)', heCategories: 'מחשבה ומוסר', heEra: 'אחרונים', fileType: 'txt', order: 1, hasToc: true, hasLinks: true },
    { id: 802, title: 'חובות הלבבות', categoryPath: 'מחשבה ומוסר/ספרי מוסר', author: 'רבנו בחיי אבן פקודה', heCategories: 'מחשבה ומוסר', heEra: 'ראשונים', fileType: 'txt', order: 2, hasToc: true, hasLinks: true },
    { id: 803, title: 'ספר הכוזרי', categoryPath: 'מחשבה ומוסר/ספרי מחשבה', author: 'רבי יהודה הלוי', heCategories: 'מחשבה', heEra: 'ראשונים', fileType: 'txt', order: 3, hasToc: true, hasLinks: true },

    // סידורים ותפילות
    { id: 901, title: 'סידור תפילת כל פה - אשכנז', categoryPath: 'תפילה וסידורים/סידורים', author: 'חכמי ישראל', heCategories: 'תפילה', heEra: 'כללי', fileType: 'txt', order: 1, hasToc: true, hasLinks: true }
  ];

  const categories: CategoryNode[] = [
    {
      id: 'tanakh',
      name: 'תנ"ך',
      path: 'תנ"ך',
      children: [
        { id: 'torah', name: 'תורה', path: 'תנ"ך/תורה' },
        { id: 'neviim', name: 'נביאים', path: 'תנ"ך/נביאים' },
        { id: 'ketuvim', name: 'כתובים', path: 'תנ"ך/כתובים' }
      ]
    },
    {
      id: 'mishna',
      name: 'משנה',
      path: 'משנה',
      children: [
        { id: 'zeraim', name: 'סדר זרעים', path: 'משנה/סדר זרעים' },
        { id: 'moed', name: 'סדר מועד', path: 'משנה/סדר מועד' },
        { id: 'nashim', name: 'סדר נשים', path: 'משנה/סדר נשים' },
        { id: 'nezikin', name: 'סדר נזיקין', path: 'משנה/סדר נזיקין' }
      ]
    },
    {
      id: 'gemara',
      name: 'גמרא',
      path: 'גמרא',
      children: [
        { id: 'bavli', name: 'תלמוד בבלי', path: 'גמרא/תלמוד בבלי' },
        { id: 'yerushalmi', name: 'תלמוד ירושלמי', path: 'גמרא/תלמוד ירושלמי' }
      ]
    },
    {
      id: 'midrash',
      name: 'מדרש',
      path: 'מדרש',
      children: [
        { id: 'midrash_rabbah', name: 'מדרש רבה', path: 'מדרש/מדרש רבה' },
        { id: 'tanhuma', name: 'תנחומא', path: 'מדרש/תנחומא' }
      ]
    },
    {
      id: 'halakha',
      name: 'הלכה',
      path: 'הלכה',
      children: [
        { id: 'rambam', name: 'רמב"ם', path: 'הלכה/רמב"ם' },
        { id: 'shulchan_aruch', name: 'שולחן ערוך', path: 'הלכה/שולחן ערוך' },
        { id: 'mishna_berura', name: 'משנה ברורה', path: 'הלכה/נושאי כלי שולחן ערוך/משנה ברורה' }
      ]
    },
    {
      id: 'chasidut',
      name: 'חסידות',
      path: 'חסידות',
      children: [
        { id: 'chabad', name: 'חב"ד', path: 'חסידות/חב"ד' },
        { id: 'breslev', name: 'ברסלב', path: 'חסידות/ברסלב' },
        { id: 'chasidut_general', name: 'כללי', path: 'חסידות/כללי' }
      ]
    },
    {
      id: 'kabbalah',
      name: 'קבלה',
      path: 'קבלה',
      children: [
        { id: 'zohar', name: 'זוהר', path: 'קבלה/זוהר' },
        { id: 'ari', name: 'כתבי האר"י', path: 'קבלה/כתבי האר"י' }
      ]
    },
    {
      id: 'machshava',
      name: 'מחשבה ומוסר',
      path: 'מחשבה ומוסר',
      children: [
        { id: 'musar', name: 'ספרי מוסר', path: 'מחשבה ומוסר/ספרי מוסר' },
        { id: 'philosophy', name: 'ספרי מחשבה', path: 'מחשבה ומוסר/ספרי מחשבה' }
      ]
    },
    {
      id: 'tefila',
      name: 'תפילה וסידורים',
      path: 'תפילה וסידורים',
      children: [
        { id: 'sidurim', name: 'סידורים', path: 'תפילה וסידורים/סידורים' }
      ]
    }
  ];

  return { categories, books };
}

// Generate sample rich text content for books
function getSampleBookContent(title: string): string {
  if (title === 'בראשית') {
    return `בראשית פרק א

א בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַייִם וְאֵת הָאָרֶץ:
ב וְהָאָרֶץ הָיְתָה תֹהוּ וָבֹהוּ וְחֹשֶׁךְ עַל פְּנֵי תְהוֹם וְרוּחַ אֱלֹהִים מְרַחֶפֶת עַל פְּנֵי הַמָּיִם:
ג וַיֹּאמֶר אֱלֹהִים יְהִי אוֹר וַיְהִי אוֹר:
ד וַיַּרְא אֱלֹהִים אֶת הָאוֹר כִּי טוֹב וַיַּבְדֵּל אֱלֹהִים בֵּין הָאוֹר וּבֵין הַחֹשֶׁךְ:
ה וַיִּקְרָא אֱלֹהִים לָאוֹר יוֹם וְלַחֹשֶׁךְ קָרָא לָיְלָה וַיְהִי עֶרֶב וַיְהִי בֹקֶר יוֹם אֶחָד:

בראשית פרק ב

א וַיְכֻלּוּ הַשָּׁמַייִם וְהָאָרֶץ וְכָל צְבָאָם:
ב וַיְכַל אֱלֹהִים בַּיּוֹם הַשְּׁבִיעִי מְלַאכְתּוֹ אֲשֶׁר עָשָׂה וַיִּשְׁבֹּת בַּיּוֹם הַשְּׁבִיעִי מִכָּל מְלַאכְתּוֹ אֲשֶׁר עָשָׂה:
ג וַיְבָרֶךְ אֱלֹהִים אֶת יוֹם הַשְּׁבִיעִי וַיְקַדֵּשׁ אֹתוֹ כִּי בוֹ שָׁבַת מִכָּל מְלַאכְתּוֹ אֲשֶׁר בָּרָא אֱלֹהִים לַעֲשׂוֹת:`;
  }

  if (title === 'מסילת ישרים') {
    return `ספר מסילת ישרים - לרמח"ל

הקדמת המחבר

אמר המחבר: החיבור הזה לא חברתיו ללמד לבני האדם את אשר לא ידעו, אלא להזכירם את הנודע להם כבר ומפורסם אצלם פרסום גדול. כי לא תמצא ברוב דברי את הדברים אשר תחשוב אותם לחדושים, אלא דברים שרוב בני האדם יודעים אותם ולא מסתפקים בהם כלל. אלא שכפי רוב פרסומם וכפי מה שהאמת שלהם גלויה לכל, כך ההעלם מהם מצוי מאד והשכחה רבה:

פרק א - בביאור כלל חובת האדם בעולמו

יסוד החסידות ושורש העבודה התמימה הוא שיתברר ויתאמת אצל האדם מה חובתו בעולמו ולמה צריך שישים מבטו ומגמתו בכל אשר הוא עמל כל ימי חייו.
והנה מה שהורונו חכמינו זכרונם לברכה הוא, שהאדם לא נברא אלא להתענג על ה' ולהנות מזיו שכינתו שזהו התענוג האמיתי והעידון הגדול מכל העידונים שיכולים להימצא:`;
  }

  if (title === 'תניא - ליקוטי אמרים') {
    return `ספר התניא - ליקוטי אמרים

הקדמת המלקט

הנה לפי ששמעתי בלחישת חרש רבת בני עמנו האומרים כי הספרים הללו הנדפסים בליקוטי אמרים אינם מובנים לכל, על כן באתי להבהיר עניין לימוד התניא ואיך כל אדם יכול לעבוד את ה' במוחו ולבו.

פרק א

תניא בסוף פרק ג' דנדה: משביעים אותו תהי צדיק ואל תהי רשע, ואפילו כל העולם כולו אומרים לך צדיק אתה - היה בעיניך כרשע.
וצריך להבין, דהא תנן (אבות פ"ב): ואל תהי רשע בפני עצמך! וגם אם יהיה בעיניו כרשע ירע לבבו ויעצב, ולא יוכל לעבוד ה' בשמחה ובטוב לבב.
אלא העניין הוא, שיש שתי נפשות באדם: נפש אחת מצד הקליפה וסטרא אחרא, ונפש השנית בישראל היא חלק אלוה ממעל ממש.`;
  }

  if (title === 'תלמוד בבלי ברכות') {
    return `מסכת ברכות - דף ב עמוד א

מאימתי קורין את שמע בערבית? משעה שהכהנים נכנסים לאכול בתרומתן, עד סוף האשמורה הראשונה - דברי רבי אליעזר.
וחכמים אומרים: עד חצות.
רבן גמליאל אומר: עד שיעלה עמוד השחר.

תנא הֵיכָא קָאֵי דְּקָתָנֵי מֵאֵימָתַי?
חֲסָרָה מְהָא דִּכְתִיב: "בְּשָׁכְבְּךָ וּבְקוּמֶךָ", וְהָכִי קָאָמַר: זְמַן קְרִיאַת שְׁמַע דִּשְׁכִיבָה מֵאֵימָתַי? מִשָּׁעָה שֶׁהַכֹּהֲנִים נִכְנָסִים לֶאֱכֹל בִּתְרוּמָתָן.`;
  }

  if (title === 'שולחן ערוך אורח חיים') {
    return `שולחן ערוך - אורח חיים - סימן א

דין הנהגת האדם בבוקר

סעיף א: יתגבר כארי לעמוד בבוקר לעבודת בוראו, שיהיה הוא מעורר השחר.
הגה: "שוויתי ה' לנגדי תמיד" הוא כלל גדול בתורה ובמעלות הצדיקים אשר הולכים לפני האלקים. כי אין ישיבת האדם ותנועותיו ועסקיו והוא לבדו בביתו, כישיבתו ותנועותיו ועסקיו והוא לפני מלך גדול; ולא דיבורו והרחבת פיו כרצונו והוא עם אנשי ביתו וקרוביו, כדיבורו במושב המלך.

סעיף ב: כשינעור משנתו יאמר: "מודה אני לפניך מלך חי וקיים שהחזרת בי נשמתי בחמלה רבה אמונתך".`;
  }

  // Generic fallback for any other book
  return `${title}

פרק א

א. אשרי האיש אשר לא הלך בעצת רשעים ובלשון חכמים יהגה יומם ולילה.
ב. הנה החיבור הלזה נכלל במאגר אוצרייה המרכזי בשרת.
ג. תוכן הספר זמין לקריאה, עיון, חיפוש מהיר והשוואת מפרשים.

פרק ב

א. דברי חכמים כדרבונות וכמסמרות נטועים בעלי אסופות.
ב. ניתן לעיין בתוכן העניינים ובפסוקים/סעיפים המקבילים בלחיצה אחת.`;
}

// Get sample Toc for books
function getBookToc(title: string): TocNode[] {
  return [
    {
      title: 'הקדמה',
      index: 1,
      children: [
        { title: 'פתח הדבר', index: 1 },
        { title: 'כוונת המחבר', index: 3 }
      ]
    },
    {
      title: 'פרק א',
      index: 5,
      children: [
        { title: 'סעיף א', index: 5 },
        { title: 'סעיף ב', index: 8 },
        { title: 'סעיף ג', index: 12 }
      ]
    },
    {
      title: 'פרק ב',
      index: 15,
      children: [
        { title: 'סעיף א', index: 15 },
        { title: 'סעיף ב', index: 19 }
      ]
    },
    {
      title: 'פרק ג',
      index: 25,
      children: [
        { title: 'סעיף א', index: 25 },
        { title: 'סיכום העניין', index: 30 }
      ]
    }
  ];
}

// Get commentary links for a line/section
function getBookLinks(title: string, lineIndex: number) {
  return [
    {
      sourceBook: 'רש"י',
      category: 'מפרשים',
      line: lineIndex,
      text: `רש"י על ${title}: "פירש רש"י ז"ל לפי שפשוטו של מקרא ודברי חכמים מכוונים כאן ללמדנו מוסר ודעת."`
    },
    {
      sourceBook: 'מצודת דוד',
      category: 'מפרשים',
      line: lineIndex,
      text: `מצודת דוד: "ביאור העניין הוא להסביר את כוונת המילים בבהירות קלה לפשוטו של מקרא."`
    },
    {
      sourceBook: 'שפתי חכמים',
      category: 'מפרשים',
      line: lineIndex,
      text: `שפתי חכמים: "בא להסביר מפני מה הוצרך רש"י לפרש כן ולא פירש כפשוטו."`
    }
  ];
}

// Initialize library dataset if not present
function initializeLibraryStorage() {
  serverState.status = 'initializing';
  
  if (!fs.existsSync(CATALOG_FILE)) {
    console.log('[Otzaria Server] Catalog not found. Initializing core library dataset...');
    const catalogData = createDefaultCatalog();
    fs.writeFileSync(CATALOG_FILE, JSON.stringify(catalogData, null, 2), 'utf8');

    // Create text files for books
    let totalBytes = 0;
    catalogData.books.forEach(book => {
      const bookPath = path.join(BOOKS_DIR, `${book.id}.txt`);
      const content = getSampleBookContent(book.title);
      fs.writeFileSync(bookPath, content, 'utf8');
      totalBytes += Buffer.byteLength(content, 'utf8');
    });

    serverState.totalBooks = catalogData.books.length;
    serverState.downloadedBytes = totalBytes;
    serverState.storageUsageMB = Number((totalBytes / (1024 * 1024)).toFixed(2));
    serverState.progress = 100;
    serverState.status = 'ready';
    serverState.lastUpdated = new Date().toISOString();
    console.log(`[Otzaria Server] Initialization complete. ${catalogData.books.length} books ready in server storage.`);
  } else {
    try {
      const raw = fs.readFileSync(CATALOG_FILE, 'utf8');
      const catalog = JSON.parse(raw);
      const bookFiles = fs.readdirSync(BOOKS_DIR);
      
      let totalBytes = 0;
      bookFiles.forEach(f => {
        const stat = fs.statSync(path.join(BOOKS_DIR, f));
        totalBytes += stat.size;
      });

      serverState.totalBooks = catalog.books ? catalog.books.length : bookFiles.length;
      serverState.downloadedBytes = totalBytes;
      serverState.storageUsageMB = Number((totalBytes / (1024 * 1024)).toFixed(2));
      serverState.progress = 100;
      serverState.status = 'ready';
      serverState.lastUpdated = new Date().toISOString();
      console.log(`[Otzaria Server] Library loaded from server storage: ${serverState.totalBooks} books, ${serverState.storageUsageMB} MB.`);
    } catch (err) {
      console.error('[Otzaria Server] Error reading catalog:', err);
      serverState.status = 'error';
    }
  }
}

// Run initial setup
initializeLibraryStorage();

// API Endpoints

// Server status & download progress
app.get('/api/status', (req, res) => {
  res.json(serverState);
});

// Trigger download/sync of library dataset to server
app.post('/api/library/download', (req, res) => {
  serverState.status = 'downloading';
  serverState.progress = 10;

  // Simulate streaming/downloading process over 3 seconds
  const interval = setInterval(() => {
    serverState.progress += 30;
    serverState.storageUsageMB += 15;
    serverState.totalBooks += 12;

    if (serverState.progress >= 100) {
      clearInterval(interval);
      serverState.progress = 100;
      serverState.status = 'ready';
      serverState.lastUpdated = new Date().toISOString();
    }
  }, 800);

  res.json({ message: 'הורדת והרחבת מאגר הספרים בשרת החלה בהצלחה', state: serverState });
});

// Get catalog tree
app.get('/api/library/tree', (req, res) => {
  try {
    if (!fs.existsSync(CATALOG_FILE)) {
      initializeLibraryStorage();
    }
    const raw = fs.readFileSync(CATALOG_FILE, 'utf8');
    const catalog = JSON.parse(raw);
    res.json(catalog);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load catalog' });
  }
});

// Get book content
app.get('/api/books/:id/content', (req, res) => {
  const bookId = req.params.id;
  const bookFile = path.join(BOOKS_DIR, `${bookId}.txt`);

  if (!fs.existsSync(bookFile)) {
    // If book file is missing, find book title from catalog and generate content
    try {
      const catalog = JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf8'));
      const book = catalog.books.find((b: any) => String(b.id) === String(bookId));
      if (book) {
        const text = getSampleBookContent(book.title);
        fs.writeFileSync(bookFile, text, 'utf8');
        return res.json({ id: bookId, title: book.title, content: text });
      }
    } catch (e) {}
    return res.status(404).json({ error: 'Book not found in server storage' });
  }

  try {
    const catalog = JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf8'));
    const book = catalog.books.find((b: any) => String(b.id) === String(bookId));
    const content = fs.readFileSync(bookFile, 'utf8');
    res.json({ id: bookId, title: book ? book.title : 'ספר', content });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read book content' });
  }
});

// Get book TOC
app.get('/api/books/:id/toc', (req, res) => {
  const bookId = req.params.id;
  try {
    const catalog = JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf8'));
    const book = catalog.books.find((b: any) => String(b.id) === String(bookId));
    const toc = getBookToc(book ? book.title : 'ספר');
    res.json({ id: bookId, toc });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load Table of Contents' });
  }
});

// Get book links/commentaries
app.get('/api/books/:id/links', (req, res) => {
  const bookId = req.params.id;
  const line = parseInt(req.query.line as string) || 1;
  try {
    const catalog = JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf8'));
    const book = catalog.books.find((b: any) => String(b.id) === String(bookId));
    const links = getBookLinks(book ? book.title : 'ספר', line);
    res.json({ id: bookId, line, links });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load links' });
  }
});

// Full-text search
app.post('/api/search', (req, res) => {
  const { query, category, exactMatch, gematriaSearch } = req.body;

  if (!query || query.trim() === '') {
    return res.json({ query: '', resultsCount: 0, results: [] });
  }

  try {
    const catalog = JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf8'));
    const results: Array<{
      bookId: number;
      bookTitle: string;
      categoryPath: string;
      lineIndex: number;
      snippet: string;
    }> = [];

    const searchQuery = query.trim().toLowerCase();

    catalog.books.forEach((book: BookItem) => {
      // Filter category if specified
      if (category && category !== 'all' && !book.categoryPath.includes(category)) {
        return;
      }

      const bookPath = path.join(BOOKS_DIR, `${book.id}.txt`);
      let content = '';
      if (fs.existsSync(bookPath)) {
        content = fs.readFileSync(bookPath, 'utf8');
      } else {
        content = getSampleBookContent(book.title);
      }

      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (line.toLowerCase().includes(searchQuery)) {
          results.push({
            bookId: book.id,
            bookTitle: book.title,
            categoryPath: book.categoryPath,
            lineIndex: index + 1,
            snippet: line.trim()
          });
        }
      });
    });

    res.json({
      query,
      resultsCount: results.length,
      results
    });
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// Start Express server with Vite in dev mode or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });

    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[Otzaria Server] Server running on http://localhost:${PORT}`);
  });
}

startServer();
