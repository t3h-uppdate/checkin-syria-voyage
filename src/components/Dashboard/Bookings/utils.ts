
export const getNationalityLabelUtil = (code: string | null) => {
  if (!code) return "Not provided";
  
  const countries: Record<string, string> = {
    us: 'United States',
    uk: 'United Kingdom',
    ca: 'Canada',
    au: 'Australia',
    fr: 'France',
    de: 'Germany',
    it: 'Italy',
    es: 'Spain',
    jp: 'Japan',
    cn: 'China',
    br: 'Brazil',
    mx: 'Mexico',
    in: 'India',
    ru: 'Russia',
    za: 'South Africa',
    sg: 'Singapore',
    ae: 'United Arab Emirates',
    sa: 'Saudi Arabia',
    tr: 'Turkey',
    sy: 'Syria',
    lb: 'Lebanon',
    jo: 'Jordan',
    iq: 'Iraq',
  };
  
  return countries[code.toLowerCase()] || code;
};
