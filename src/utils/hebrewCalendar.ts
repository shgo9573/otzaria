import { DailyStudyItem } from '../types';

export function getHebrewDateString(): string {
  const today = new Date();
  const day = today.getDate();
  const monthNamesHe = [
    'תשרי', 'חשון', 'כסלו', 'טבת', 'שבט', 'אדר', 'ניסן', 'אייר', 'סיון', 'תמוז', 'אב', 'אלול'
  ];
  // Simple calculation for display
  return `י"ח תשרי תשפ"ו`;
}

export function getDailyStudySchedule(): DailyStudyItem[] {
  return [
    {
      type: 'daf_yomi',
      title: 'דף יומי',
      bookTitle: 'תלמוד בבלי - ברכות',
      bookId: 'talmud_berakhot',
      portion: 'דף ב ע"א - ע"ב',
      chapterIndex: 0,
      description: 'מאימתי קורין את שמע בערבית - משעה שהכהנים נכנסים לאכול בתרומתן'
    },
    {
      type: 'parasha',
      title: 'פרשת השבוע',
      bookTitle: 'חומש בראשית',
      bookId: 'torah_bereshit',
      portion: 'פרשת בראשית (פרק א - פרק ו)',
      chapterIndex: 0,
      description: 'בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ'
    },
    {
      type: 'mishnah_yomi',
      title: 'משנה יומית',
      bookTitle: 'משנה ברכות',
      bookId: 'mishnah_berakhot',
      portion: 'פרק א משנה א-ב',
      chapterIndex: 0,
      description: 'מאימתי קורין את שמע בערבין'
    },
    {
      type: 'rambam',
      title: 'רמב"ם יומי',
      bookTitle: 'רמב"ם - הלכות קריאת שמע',
      bookId: 'rambam_kriat_shema',
      portion: 'פרק א',
      chapterIndex: 0,
      description: 'פעמים בכל יום קוראין קריאת שמע בערב ובבקר'
    }
  ];
}
