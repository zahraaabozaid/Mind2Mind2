// Arab-focused mock data and utilities
export const arabNames = {
  egyptian: ['أحمد محمد', 'فاطمة علي', 'محمود حسن', 'نور إبراهيم', 'سارة محمود', 'علي أحمد', 'ليلى محمد', 'خالد حسن'],
  saudi: ['محمد عبدالله', 'نورا سلمان', 'فيصل علي', 'دينا محمد', 'عبدالرحمن حمد', 'هند سعود', 'سلطان عبدالعزيز', 'ريم فهد'],
  emirati: ['محمد راشد', 'فاطمة محمد', 'علي منصور', 'زايد خليفة', 'أمل عبدالله', 'حمد علي', 'ليلى سالم', 'خليفة محمد'],
  jordanian: ['أحمد الأردني', 'سارة عبدالله', 'محمود علي', 'رنا محمد', 'علي حسن', 'دينا أحمد', 'خالد محمود', 'ليلى علي'],
  lebanese: ['جورج حبيب', 'ريتا فارس', 'محمود عيسى', 'ندى محمد', 'علي حسين', 'سامية أحمد', 'خليل محمود', 'هيام علي'],
  moroccan: ['محمد أمين', 'فاطمة الزهراء', 'علي الحسن', 'نور محمد', 'حسن علي', 'ليلى أحمد', 'خالد محمد', 'سارة حسن'],
  tunisian: ['محمود بن علي', 'فاطمة بن محمد', 'علي بن حسن', 'نور بن أحمد', 'سارة بن علي', 'خالد بن محمود', 'ليلى بن حسن', 'أحمد بن علي'],
  kuwaiti: ['محمد الصباح', 'فاطمة الأحمد', 'علي الجابر', 'نور الدعيج', 'سارة الخليفة', 'خالد الوزان', 'ليلى الشمري', 'أحمد العتيبي'],
};

export const arabCities = [
  { name: 'Cairo', country: 'Egypt', currency: 'EGP' },
  { name: 'Alexandria', country: 'Egypt', currency: 'EGP' },
  { name: 'Riyadh', country: 'Saudi Arabia', currency: 'SAR' },
  { name: 'Jeddah', country: 'Saudi Arabia', currency: 'SAR' },
  { name: 'Dubai', country: 'UAE', currency: 'AED' },
  { name: 'Abu Dhabi', country: 'UAE', currency: 'AED' },
  { name: 'Amman', country: 'Jordan', currency: 'JOD' },
  { name: 'Beirut', country: 'Lebanon', currency: 'LBP' },
  { name: 'Casablanca', country: 'Morocco', currency: 'MAD' },
  { name: 'Marrakech', country: 'Morocco', currency: 'MAD' },
  { name: 'Tunis', country: 'Tunisia', currency: 'TND' },
  { name: 'Kuwait City', country: 'Kuwait', currency: 'KWD' },
  { name: 'Baghdad', country: 'Iraq', currency: 'IQD' },
  { name: 'Damascus', country: 'Syria', currency: 'SYP' },
  { name: 'Khartoum', country: 'Sudan', currency: 'SDG' },
  { name: 'Tripoli', country: 'Libya', currency: 'LYD' },
  { name: 'Muscat', country: 'Oman', currency: 'OMR' },
  { name: 'Sana\'a', country: 'Yemen', currency: 'YER' },
  { name: 'Manama', country: 'Bahrain', currency: 'BHD' },
  { name: 'Doha', country: 'Qatar', currency: 'QAR' },
];

export const arabUniversities = [
  { name: 'Cairo University', country: 'Egypt' },
  { name: 'American University in Cairo (AUC)', country: 'Egypt' },
  { name: 'Ain Shams University', country: 'Egypt' },
  { name: 'King Saud University', country: 'Saudi Arabia' },
  { name: 'King Abdulaziz University', country: 'Saudi Arabia' },
  { name: 'KAUST', country: 'Saudi Arabia' },
  { name: 'UAE University', country: 'UAE' },
  { name: 'American University of Sharjah', country: 'UAE' },
  { name: 'University of Jordan', country: 'Jordan' },
  { name: 'American University of Beirut (AUB)', country: 'Lebanon' },
  { name: 'Mohammed V University', country: 'Morocco' },
  { name: 'University of Tunis', country: 'Tunisia' },
  { name: 'Qatar University', country: 'Qatar' },
  { name: 'Kuwait University', country: 'Kuwait' },
  { name: 'University of Baghdad', country: 'Iraq' },
  { name: 'Damascus University', country: 'Syria' },
  { name: 'University of Khartoum', country: 'Sudan' },
  { name: 'University of Tripoli', country: 'Libya' },
  { name: 'Sultan Qaboos University', country: 'Oman' },
  { name: 'Sana\'a University', country: 'Yemen' },
];

export const currencies = {
  EGP: { symbol: 'ج.م', name: 'Egyptian Pound' },
  SAR: { symbol: 'ر.س', name: 'Saudi Riyal' },
  AED: { symbol: 'د.إ', name: 'UAE Dirham' },
  JOD: { symbol: 'د.ا', name: 'Jordanian Dinar' },
  LBP: { symbol: 'ل.ل', name: 'Lebanese Pound' },
  MAD: { symbol: 'د.م.', name: 'Moroccan Dirham' },
  TND: { symbol: 'د.ت', name: 'Tunisian Dinar' },
  KWD: { symbol: 'د.ك', name: 'Kuwaiti Dinar' },
  IQD: { symbol: 'ع.د', name: 'Iraqi Dinar' },
  SYP: { symbol: 'ل.س', name: 'Syrian Pound' },
  SDG: { symbol: 'ج.س', name: 'Sudanese Pound' },
  LYD: { symbol: 'ل.د', name: 'Libyan Dinar' },
  OMR: { symbol: 'ر.ع.', name: 'Omani Rial' },
  YER: { symbol: 'ر.ي', name: 'Yemeni Rial' },
  BHD: { symbol: 'د.ب', name: 'Bahraini Dinar' },
  QAR: { symbol: 'ر.ق', name: 'Qatari Riyal' },
};

export const skillCategories = [
  { id: '1', name: 'Technology', icon: '💻', color: 'from-blue-500 to-blue-600' },
  { id: '2', name: 'Languages', icon: '🗣️', color: 'from-purple-500 to-purple-600' },
  { id: '3', name: 'Business', icon: '💼', color: 'from-green-500 to-green-600' },
  { id: '4', name: 'Creative', icon: '🎨', color: 'from-pink-500 to-pink-600' },
  { id: '5', name: 'Fitness', icon: '💪', color: 'from-orange-500 to-orange-600' },
  { id: '6', name: 'Music', icon: '🎵', color: 'from-red-500 to-red-600' },
  { id: '7', name: 'Cooking', icon: '👨‍🍳', color: 'from-yellow-500 to-yellow-600' },
  { id: '8', name: 'Personal Development', icon: '📚', color: 'from-indigo-500 to-indigo-600' },
];

export function getRandomArabName(): string {
  const allNames = Object.values(arabNames).flat();
  return allNames[Math.floor(Math.random() * allNames.length)];
}

export function getRandomArabCity(): { name: string; country: string; currency: string } {
  return arabCities[Math.floor(Math.random() * arabCities.length)];
}

export function getRandomArabUniversity(): { name: string; country: string } {
  return arabUniversities[Math.floor(Math.random() * arabUniversities.length)];
}

export function generateArabAvatarUrl(name: string): string {
  // Using UI Avatars service with Arabic name
  const encodedName = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff&bold=true&rounded=true`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
