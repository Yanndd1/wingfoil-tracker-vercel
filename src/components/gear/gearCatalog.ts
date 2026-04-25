/**
 * Pumpfoil / Wingfoil / Surf-Foil gear catalog.
 *
 * Catalogue des marques et modèles populaires (2023-2026) pour alimenter
 * les dropdowns de saisie matériel. Chaque catégorie expose un mapping
 * { marque -> { gamme/modèle -> tailles[] } }.
 *
 * Notes:
 * - Les tailles de boards mélangent pieds/pouces et litres selon la convention
 *   de chaque fabricant (les shapers wing/pump l'annoncent souvent ainsi).
 * - Les frontwings utilisent soit cm² (HS1850, HA1525...), soit des noms
 *   custom (XS, S-H, M-H...) selon la marque.
 * - Les wetsuits suivent la convention épaisseur + taille corps.
 * - Références: sites officiels des marques et boutiques fiables (foiloutlet,
 *   realwatersports, mackiteboarding, f-one.world, armstrongfoils.com,
 *   cabrinha.com, duotonesports.com, naish.com, sabfoil.com, axisfoils.com,
 *   gofoil.com, gong-galaxy.com, afs-foiling.com).
 */

export const GEAR_CATALOG = {
  // =============================================================================
  // BOARDS — planches wing / pump / surf-foil / SUP-foil
  // =============================================================================
  boards: {
    Armstrong: {
      'Wing FG': ['4\'2 / 34L', '4\'4 / 40L', '4\'6 / 48L', '4\'8 / 58L', '5\'0 / 70L', '5\'2 / 80L', '5\'4 / 90L', '5\'8 / 105L', '5\'11 / 120L', '6\'2 / 135L'],
      'FG Wing SUP': ['4\'8 / 50L', '4\'11 / 60L', '5\'2.5 / 75L', '5\'5 / 88L', '5\'8 / 99L', '5\'11 / 115L', '6\'4 / 132L'],
      'Downwind DW': ['7\'2', '7\'6', '8\'0', '8\'6'],
    },
    'F-One': {
      'Rocket Wing ASC': ['5\'0 / 60L', '5\'3 / 75L', '5\'5 / 90L', '5\'10 / 110L', '6\'2 / 130L'],
      'Rocket Wing SLX': ['4\'8 / 55L', '4\'10 / 65L', '5\'0 / 75L', '5\'3 / 90L', '5\'6 / 105L'],
      'Pocket Carbon': ['4\'1 / 30L', '4\'3 / 40L', '4\'5 / 50L', '4\'7 / 60L', '4\'9 / 70L'],
      'Rocket SUP Downwind': ['7\'6', '8\'0', '8\'6'],
    },
    Naish: {
      'Hover Wing Carbon Ultra': ['40L', '50L', '60L', '75L', '85L', '95L', '110L', '125L', '140L'],
      'Hover Wing GS': ['85L', '95L', '110L', '125L', '140L'],
      'Hover Downwind': ['7\'2', '7\'6', '8\'0'],
    },
    Cabrinha: {
      'Code Wing Foilboard': ['4\'5 / 50L', '4\'8 / 65L', '4\'11 / 80L', '5\'2 / 95L', '5\'5 / 115L'],
      'Mantis Foilboard': ['4\'10 / 70L', '5\'2 / 90L', '5\'6 / 110L'],
    },
    Duotone: {
      'Sky Free': ['34L', '40L', '48L', '58L', '70L', '80L', '90L', '105L', '120L', '135L'],
      'Sky Style': ['40L', '55L', '70L', '85L', '100L'],
      'Sky Pro': ['35L', '45L', '55L', '65L'],
      'Skybrid SLS': ['60L', '75L', '90L'],
    },
    Slingshot: {
      'Hoverglide Wing Craft': ['4\'9 / 75L', '5\'1 / 90L', '5\'6 / 110L', '5\'10 / 130L'],
      'Infinity Carbon DW': ['7\'2', '7\'6', '8\'0'],
    },
    AFS: {
      'Carver': ['4\'3 / 36L', '4\'6 / 45L', '4\'9 / 55L', '5\'0 / 65L', '5\'4 / 80L'],
      'Blackbird Sup Foil DW': ['7\'2', '7\'6', '8\'0'],
    },
    'JP Australia': {
      'X-Winger Pro': ['88L', '99L', '111L', '122L', '133L', '144L'],
      'F-Winger Pro': ['55L', '66L', '77L'],
      'R-Winger Pro': ['65L', '80L', '95L'],
      'WingAir SE (inflatable)': ['5\'0', '5\'4', '6\'0'],
    },
    Fanatic: {
      'Sky Wing TE': ['4\'6', '4\'7', '4\'8', '5\'0', '5\'2', '5\'4', '5\'6', '5\'8', '6\'3'],
      'Sky Style TE': ['4\'10', '5\'2', '5\'4', '5\'8'],
      'Sky SUP Foil': ['7\'2', '7\'6', '8\'0'],
    },
    Starboard: {
      'Take Off': ['4\'3 / 30L', '4\'7 / 45L', '4\'10 / 55L', '5\'2 / 70L', '5\'5 / 80L', '6\'0 / 95L', '6\'6 / 105L', '7\'0 / 115L', '7\'6 / 140L'],
      'Wingboard': ['4\'8 / 55L', '5\'0 / 70L', '5\'4 / 90L', '5\'8 / 115L'],
      'Ace Wing / Downwind': ['7\'2', '7\'6', '8\'0', '8\'6'],
    },
    Gong: {
      'Allvator Zuma': ['4\'2 / 30L', '4\'6 / 45L', '4\'10 / 60L', '5\'2 / 80L', '5\'6 / 100L'],
      'Allvator Hipe': ['55L', '70L', '85L', '100L', '115L'],
      'Catch DW': ['7\'0', '7\'6', '8\'0'],
      'Pump Foil Board Kluber HDCC': ['HDCC / 65', 'HDCC / 70', 'HDCC / 75', 'HDCC / 80', 'HDCC / 85'],
      'Pump Foil Board Kluber FSP': ['65', '70', '75', '80', '85', '90'],
      'Allvator Mob': ['25L', '32L', '40L', '50L', '60L'],
      'Lethal Wing': ['65L', '75L', '85L', '95L', '110L'],
    },
    Takuma: {
      'HELIUM Kujira Wing': ['4\'8 / 60L', '5\'0 / 75L', '5\'4 / 95L', '5\'8 / 115L'],
      'HELIUM Downwind': ['7\'2', '7\'6', '8\'0'],
    },
    Sroka: {
      'Sky Rider': ['5\'0 / 55L', '5\'5 / 63L', '5\'10 / 85L', '6\'2 / 105L'],
      'Sroka Air (inflatable)': ['5\'6', '6\'0', '6\'6'],
    },
  },

  // =============================================================================
  // FRONTWINGS — ailes avant (surface en cm² typiquement)
  // =============================================================================
  frontwings: {
    Armstrong: {
      'HS Series': ['HS625', 'HS850', 'HS1050', 'HS1250', 'HS1550', 'HS1850'],
      'HA Series': ['HA525', 'HA725', 'HA925', 'HA1125', 'HA1325', 'HA1525'],
      'MA Series': ['MA625', 'MA800', 'MA1000', 'MA1225', 'MA1475', 'MA1750'],
      'APF Pump Foil': ['APF1350', 'APF1675', 'APF1880'],
    },
    'F-One': {
      'Eagle HM Carbon': ['690', '790', '890', '990', '1090', '1190', '1290'],
      'Eagle X': ['600', '700', '800', '900', '1000'],
      'Phantom Carbon': ['980', '1080', '1280', '1480', '1780'],
      'Phantom S Carbon': ['740', '840', '940', '1040'],
      'SK8 HM Carbon': ['550', '650', '750', '850', '950', '1050'],
      'Seven Seas': ['1000', '1200', '1400', '1600', '1800'],
    },
    Naish: {
      'Jet HA': ['640', '840', '1040', '1240', '1440', '1640', '1840'],
      'Ultra Jet': ['650', '850', '1050', '1250', '1450', '1650', '2000', '2450'],
      'MA (Mid Aspect)': ['1000', '1200', '1400', '1600'],
    },
    Cabrinha: {
      'H-Series': ['H650', 'H800', 'H1000', 'H1050', 'H1200', 'H1300'],
      'M-Series': ['M550', 'M750', 'M1000'],
      'X-Breed': ['X800', 'X1000', 'X1200'],
    },
    Duotone: {
      'Spirit Carve': ['700'],
      'Aero Carve 2.0 D/LAB': ['850', '1050', '1350'],
      'Carve 3.0 SLS': ['850', '1050', '1350'],
      'Glide SLS': ['750', '900', '1050', '1250', '1500'],
    },
    Slingshot: {
      'Phantasm Infinity 99': ['INF99'],
      'Phantasm Infinity 84': ['INF84'],
      'Phantasm HG': ['HG76', 'HG90', 'HG110'],
    },
    AFS: {
      'Pure': ['700', '900'],
      'Pure HA': ['800', '1100'],
      'Performer': ['950', '1250', '1450', '1650', '1900'],
      'Silk': ['650', '800', '950', '1100', '1300'],
    },
    Sabfoil: {
      'Leviathan': ['950', '1150', '1350', '1550', '1750'],
      'Razor': ['WR680', 'WR780', 'WR820', 'WR880', 'WR980'],
      'Blackbird': ['805', '885', '965', '1045', '1125'],
    },
    GoFoil: {
      'RS Series': ['RS600', 'RS825', 'RS975', 'RS1075'],
      'RS-HA Series': ['RS-HA550', 'RS-HA700', 'RS-HA850', 'RS-HA1000'],
      'Maliko': ['M200', 'M280'],
      'GT Series': ['GT1650', 'GT2200'],
    },
    Axis: {
      'ART Series': ['ART899', 'ART999', 'ART1099', 'ART1201'],
      'HPS Series': ['HPS700', 'HPS880', 'HPS930', 'HPS980', 'HPS1050'],
      'BSC Series': ['BSC740', 'BSC810', 'BSC890', 'BSC970', 'BSC1060', 'BSC1120'],
      'PNG Series': ['PNG910', 'PNG1010', 'PNG1150', 'PNG1300'],
    },
    Takuma: {
      'Kujira II': ['500', '750', '980', '1095', '1210', '1440', '1500'],
      'Kujira LOL': ['980', '1210', '1440'],
    },
    Gong: {
      'Veloce H': ['XS-H', 'S-H', 'M-H', 'L-H', 'XL-H', 'XXL-H'],
      'Veloce': ['XS-T', 'S-T', 'M', 'L', 'XL', 'XXL'],
      'Curve V2': ['S', 'M', 'L', 'XL'],
      'Veloce HDW (Downwind)': ['M-HDW', 'L-HDW', 'XL-HDW'],
      'X-Over V2': ['S', 'M', 'L', 'XL'],
      'Foil Front Wing Trail V3': ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
      'Foil Front Wing Sirus V3': ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
      'Foil Front Wing Pulse V3': ['M', 'L', 'XL', 'XXL'],
      'Foil Front Wing Curve V3': ['S', 'M', 'L', 'XL'],
      'Foil Front Wing Allvator V3': ['M', 'L', 'XL', 'XXL'],
    },
    Sroka: {
      'Classic': ['1250', '1500', '1750', '2000'],
      'UHA': ['800', '930', '1100'],
      'HA Lift': ['1100', '1250', '1350', '1500'],
    },
    Levitaz: {
      'Aspect 2': ['800', '1000', '1200'],
      'Shaka': ['1200', '1500', '2000'],
      'HA Pro': ['1100', '1350', '1600'],
    },
    Code: {
      'S-Series': ['720S', '850S', '980S', '1130S', '1300S'],
      'Performance': ['615', '720', '850', '980', '1130', '1300', '1540', '1725'],
    },
  },

  // =============================================================================
  // STABS — stabilisateurs (aile arrière)
  // =============================================================================
  stabs: {
    Armstrong: {
      'HS Tail': ['HS180', 'HS200', 'HS232', 'HS260'],
      'HA Tail': ['HA175', 'HA195', 'HA220'],
      'Surf MkII': ['130', '170', '200'],
      'Speed': ['Speed 180'],
    },
    'F-One': {
      'C Series HM': ['C225', 'C250', 'C275', 'C300'],
      'DW Series': ['DW210', 'DW225', 'DW255'],
      'Fence HM': ['C250 Fence', 'C275 Fence'],
    },
    Naish: {
      'AR Stab': ['AR200', 'AR230', 'AR260'],
      'HA Stab': ['HA195', 'HA215'],
    },
    Cabrinha: {
      'H-Series Tail': ['H180', 'H200', 'H230', 'H285'],
      'V-Series': ['V200', 'V230'],
    },
    Duotone: {
      'Aero Tail D/LAB': ['180', '210', '240'],
      'Glide Tail': ['200', '230'],
    },
    Sabfoil: {
      'Razor Tail': ['T225', 'T255'],
      'Leviathan Tail': ['L245', 'L275'],
    },
    Axis: {
      'Skinny S-Series': ['S300', 'S325', 'S375', 'S400'],
      'Progressive': ['P380', 'P420', 'P460'],
      'Fuselage-Specific': ['Power-Horse', 'Flow-Horse', 'Free-Horse'],
    },
    GoFoil: {
      'GL Tail': ['GL210', 'GL250'],
      'Maliko Tail': ['M140', 'M170'],
    },
    Code: {
      'AR Tail': ['142AR', '150AR', '158AR', '175AR', '188AR'],
    },
    Gong: {
      'Tail Rise V2': ['S', 'M', 'L', 'XL'],
      'Tail Curve V2': ['S', 'M', 'L'],
      'Foil Stab Trail V3': ['S', 'M', 'L', 'XL', 'XXL'],
      'Foil Stab Fluid H V3': ['S', 'M', 'L', 'XL', '3XL'],
      'Foil Stab Fluid H V3 FG': ['S / FG', 'M / FG', 'L / FG', 'XL / FG'],
      'Foil Stab Sirus V3': ['M', 'L', 'XL'],
    },
    AFS: {
      'Pure Stab': ['250', '300'],
      'Performer Stab': ['235', '265'],
    },
  },

  // =============================================================================
  // FUSELAGES — longueur en mm
  // =============================================================================
  fuselages: {
    Armstrong: {
      'Performance': ['625mm', '725mm', '825mm', '935mm', '1035mm'],
      'TC Fuselage': ['600mm', '700mm'],
    },
    'F-One': {
      'Carbon': ['XXXS', 'XXS', 'XS', 'S', 'Long'],
      'Alloy FCT': ['Short', 'Medium', 'Long'],
    },
    Naish: {
      'Carbon System': ['55cm', '64cm', '95cm', '95cm DT'],
    },
    Cabrinha: {
      'Fusion': ['Short', 'Medium', 'Long'],
    },
    Duotone: {
      'SLS Fuse': ['Short', 'Standard', 'Long'],
    },
    Sabfoil: {
      'Blackbird R8': ['365', '385', '405'],
      'Kraken Modular': ['Short', 'Standard', 'Long'],
    },
    Axis: {
      'Ultrashort Red': ['505mm', '560mm'],
      'Black Series': ['610mm', '670mm', '700mm'],
      'Advance': ['470mm', '510mm', '560mm'],
    },
    GoFoil: {
      'RS Fuselage': ['Short', 'Medium', 'Long'],
    },
    AFS: {
      'Alu V3': ['Short', 'Standard', 'Long'],
      'Carbon': ['Short', 'Long'],
    },
    Code: {
      'AR Fuselage': ['62cm', '65cm', '68cm'],
    },
    Gong: {
      'Allvator': ['XXS', 'XS', 'S', 'M', 'L'],
      'Foil Fuselage V3 Aluminium': ['Standard / V3 Front wing - V3 Stab'],
      'Foil Fuselage V3 Titanium': ['Standard / V3 Front wing - V3 Stab'],
      'Foil Fuselage V3 Carbon': ['Standard / V3 Front wing - V3 Stab'],
    },
  },

  // =============================================================================
  // MASTS — longueur en cm (alu / carbone)
  // =============================================================================
  masts: {
    Armstrong: {
      'Performance Mast': ['72cm', '85cm', '95cm', '100cm'],
      'Alloy Mast': ['58cm', '72cm', '85cm'],
      'Evolution Carbon': ['72cm', '85cm', '95cm'],
    },
    'F-One': {
      'Carbon Mast HM': ['75cm', '85cm', '95cm', '105cm'],
      'UHM Carbon 12': ['75cm', '80cm', '85cm', '95cm'],
      'HM Carbon 14': ['75cm', '80cm', '85cm', '95cm', '105cm'],
      'Aluminium Mast': ['65cm', '75cm', '85cm'],
    },
    Naish: {
      'Carbon Mast': ['75cm', '82cm', '87cm', '95cm'],
      'Alloy Mast': ['75cm', '82cm'],
    },
    Cabrinha: {
      'Fusion Carbon Hollow': ['40cm', '65cm', '75cm', '85cm', '95cm'],
      'Fusion Carbon Prepreg': ['65cm', '75cm', '85cm', '95cm'],
      'Fusion Alloy': ['55cm', '65cm', '75cm', '85cm'],
    },
    Duotone: {
      'SLS Mast': ['72cm', '82cm', '92cm'],
      'D/LAB Aluula': ['82cm', '92cm'],
      'Aero Mast': ['65cm', '75cm', '85cm', '95cm'],
    },
    Slingshot: {
      'Phantasm Carbon': ['72cm', '82cm', '92cm', '102cm', '112cm', '125cm'],
      'Phantasm Alloy': ['72cm', '82cm'],
      'Hover Glide': ['60cm', '76cm', '90cm'],
    },
    AFS: {
      'Silk Carbon': ['75cm', '85cm', '95cm'],
      'Alu': ['75cm', '85cm', '95cm'],
    },
    Sabfoil: {
      'Blackbird UMH W-Core': ['75cm', '85cm', '95cm'],
      'Kraken Carbon': ['75cm', '85cm', '95cm', '100cm'],
    },
    GoFoil: {
      'Carbon Mast': ['60cm', '71.1cm', '81.3cm', '94cm'],
      'Alloy Mast': ['74.9cm', '85cm'],
    },
    Axis: {
      'Black Series Carbon': ['75cm', '82cm', '90cm', '95cm', '100cm', '115cm'],
      'Advance Alloy': ['75cm', '82cm', '90cm'],
      'Progressive Alloy': ['75cm', '82cm', '90cm'],
    },
    Code: {
      'Carbon': ['72cm', '82cm', '92cm'],
      'Alloy': ['72cm', '82cm'],
    },
    Gong: {
      'Carbon IKAIKA': ['65cm', '75cm', '85cm', '95cm'],
      'Alu Pro': ['65cm', '75cm', '85cm'],
      'Foil Alu Mast 70 cm V3': ['19 mm'],
      'Foil Alu Mast 80 cm V3': ['19 mm'],
      'Foil Alu Mast 90 cm V3': ['19 mm'],
      'Foil Carbon Mast HM 70 cm V3': ['19 mm'],
      'Foil Carbon Mast HM 80 cm V3': ['19 mm'],
      'Foil Carbon Mast HM 90 cm V3': ['19 mm'],
    },
    Sroka: {
      'Alu Mast': ['75cm', '85cm', '95cm'],
      'Carbon Mast': ['75cm', '85cm', '95cm'],
    },
    Takuma: {
      'AC 75 Carbon': ['75cm', '85cm'],
      'Alloy': ['75cm', '85cm'],
    },
  },

  // =============================================================================
  // WINGS — voiles wingfoil (surface en m²)
  // =============================================================================
  wings: {
    Duotone: {
      'Slick': ['2.5m²', '3.0m²', '3.5m²', '4.0m²', '4.5m²', '5.0m²', '5.5m²', '6.0m²', '7.0m²'],
      'Slick D/LAB': ['3.0m²', '3.5m²', '4.0m²', '4.5m²', '5.0m²', '5.5m²', '6.0m²'],
      'Unit': ['2.0m²', '2.5m²', '3.0m²', '3.5m²', '4.0m²', '4.5m²', '5.0m²', '5.5m²', '6.0m²', '6.5m²'],
      'Ventis': ['3.0m²', '3.5m²', '4.0m²', '4.5m²', '5.0m²', '5.5m²', '6.0m²'],
    },
    'F-One': {
      'Strike CWC': ['3.0m²', '3.5m²', '4.0m²', '4.5m²', '5.0m²', '5.5m²', '6.0m²', '7.0m²', '8.0m²', '9.0m²'],
      'Strike V5 CWC Aluula': ['3.5m²', '4.0m²', '4.5m²', '5.0m²', '5.5m²', '6.0m²'],
      'Swing': ['3.0m²', '3.5m²', '4.0m²', '4.5m²', '5.0m²', '5.5m²'],
    },
    Naish: {
      'ADX Wing-Surfer': ['2.0m²', '2.5m²', '3.0m²', '3.5m²', '4.0m²', '4.5m²', '5.0m²', '5.5m²', '6.0m²', '7.0m²'],
      'Wing-Surfer MK4': ['2.5m²', '3.0m²', '3.5m²', '4.0m²', '4.5m²', '5.0m²', '5.5m²', '6.0m²', '6.5m²', '7.5m²'],
      'Atom': ['7.0m²', '8.0m²'],
    },
    Cabrinha: {
      'Mantis V4': ['2.0m²', '2.5m²', '3.0m²', '3.5m²', '4.0m²', '4.5m²', '5.0m²', '6.0m²'],
      'Mantis V5': ['2.0m²', '2.5m²', '3.0m²', '3.5m²', '4.0m²', '4.5m²', '5.0m²', '5.5m²', '6.0m²'],
      'Crosswing X3': ['3.0m²', '4.0m²', '5.0m²', '6.0m²'],
    },
    Ozone: {
      'Flux V2': ['3.0m²', '3.6m²', '4.3m²', '5.0m²', '5.5m²', '6.0m²'],
      'Flux V2 Ultra-X': ['3.0m²', '3.6m²', '4.3m²', '5.0m²'],
      'Flow V2': ['2.5m²', '3.0m²', '3.5m²', '4.0m²', '4.5m²', '5.0m²', '5.5m²', '6.0m²', '7.0m²'],
    },
    North: {
      'Loft Pro': ['3.0m²', '4.0m²', '5.0m²', '6.0m²', '8.0m² LW'],
      'Mode Pro': ['3.5m²', '4.2m²', '4.8m²', '5.5m²', '6.0m²', '6.5m²'],
      'Nova': ['3.5m²', '4.2m²', '4.8m²', '5.5m²', '6.5m²'],
    },
    Reedin: {
      'SuperNatural': ['3.0m²', '3.5m²', '4.0m²', '4.5m²', '5.0m²', '5.5m²', '6.0m²', '7.0m²'],
      'HyperNatural': ['4.0m²', '4.5m²', '5.0m²', '5.5m²', '6.0m²'],
      'SuperWingX': ['3.0m²', '3.5m²', '4.0m²', '4.5m²', '5.0m²', '5.5m²', '6.0m²'],
      'Big E': ['7.0m²', '8.0m²'],
    },
    Ensis: {
      'Score V3': ['2.8m²', '3.5m²', '4.0m²', '4.5m²', '5.2m²', '5.9m²', '6.6m²'],
      'Score Limited Edition': ['3.5m²', '4.0m²', '4.5m²', '5.2m²'],
      'Sprint': ['3.0m²', '4.0m²', '5.0m²', '6.0m²'],
    },
    Eleveight: {
      'WFS V3': ['3.0m²', '4.0m²', '4.8m²', '5.5m²', '6.5m²'],
      'RS Wing': ['3.5m²', '4.0m²', '4.5m²', '5.0m²', '5.5m²', '6.0m²'],
    },
    Slingshot: {
      'Slingwing V5': ['3.0m²', '4.0m²', '5.0m²', '6.0m²'],
    },
    Takuma: {
      'Concept-K': ['3.0m²', '4.0m²', '5.0m²', '6.0m²'],
    },
    Sroka: {
      'Wing V4': ['3.0m²', '4.0m²', '5.0m²', '6.0m²', '7.0m²'],
      'Wing Performer': ['3.5m²', '4.2m²', '5.0m²', '5.8m²'],
    },
    Gong: {
      'Plus2': ['3.0m²', '3.5m²', '4.0m²', '4.5m²', '5.0m²', '5.5m²', '6.0m²', '7.0m²'],
      'Pulse X': ['3.5m²', '4.0m²', '4.5m²', '5.0m²', '5.5m²', '6.0m²'],
    },
  },

  // =============================================================================
  // LEASHES — longueur en pieds
  // =============================================================================
  leashes: {
    Dakine: {
      'Foil Coil Leash': ['5ft', '6ft', '7ft'],
      'Foil Comp Ankle': ['5ft', '6ft'],
      'Floating Coil Foil': ['7ft'],
    },
    FCS: {
      'Freedom Leash': ['5ft', '6ft', '7ft', '8ft', '9ft'],
      'All Round Essential': ['6ft', '7ft', '8ft', '9ft'],
      'Foil Freedom Helix': ['5ft', '6ft'],
    },
    Kaohi: {
      'Straight Foil': ['4ft', '5ft', '6ft'],
      'Coil Foil': ['5ft', '6ft'],
    },
    Ocean: {
      'Coil Foil Leash': ['5ft', '6ft', '7ft'],
      'Comp Leash': ['5ft', '6ft'],
    },
    'Stay Covered': {
      'Standard': ['5ft', '6ft', '7ft', '8ft', '9ft'],
      'Grom': ['5ft', '6ft'],
    },
    Armstrong: {
      'Coil Leash': ['6ft', '7ft', '8ft'],
    },
    Naish: {
      'Coil Leash': ['6ft', '7ft'],
    },
    Creatures: {
      'Icon Lite': ['5ft', '6ft', '7ft', '8ft', '9ft'],
      'Pro Reliance': ['6ft', '7ft'],
    },
    'North Kiteboarding': {
      'Coil Leash': ['6ft', '7ft'],
    },
  },

  // =============================================================================
  // WETSUITS — combinaisons (épaisseur + taille)
  // =============================================================================
  wetsuits: {
    Manera: {
      'Seafarer': ['2/2 S', '2/2 M', '2/2 L', '2/2 XL', '3/2 S', '3/2 M', '3/2 L', '3/2 XL', '4/3 S', '4/3 M', '4/3 L', '4/3 XL', '5/4/3 M', '5/4/3 L', '5/4/3 XL'],
      'Magma': ['3/2 S', '3/2 M', '3/2 L', '3/2 XL', '4/3 S', '4/3 M', '4/3 L', '4/3 XL', '5/4/3 M', '5/4/3 L', '5/4/3 XL'],
      'Meteor': ['3/2 S', '3/2 M', '3/2 L', '3/2 XL', '4/3 S', '4/3 M', '4/3 L', '4/3 XL'],
    },
    Patagonia: {
      'R1 Yulex Front-Zip': ['1.5mm XS', '1.5mm S', '1.5mm M', '1.5mm L', '1.5mm XL', '1.5mm XXL'],
      'R2 Yulex': ['3.5/3mm XS', '3.5/3mm S', '3.5/3mm M', '3.5/3mm L', '3.5/3mm XL', '3.5/3mm XXL'],
      'R3 Yulex Regulator': ['4.5/3.5mm S', '4.5/3.5mm M', '4.5/3.5mm L', '4.5/3.5mm XL', '4.5/3.5mm XXL'],
      'R4 Yulex Hooded': ['5.5/4mm S', '5.5/4mm M', '5.5/4mm L', '5.5/4mm XL'],
    },
    "O'Neill": {
      Hyperfreak: ['2mm S', '2mm M', '2mm L', '2mm XL', '3/2 S', '3/2 M', '3/2 L', '3/2 XL', '4/3+ S', '4/3+ M', '4/3+ L', '4/3+ XL', '5/4+ M', '5/4+ L', '5/4+ XL'],
      'Psycho Tech': ['3/2 S', '3/2 M', '3/2 L', '3/2 XL', '4/3+ M', '4/3+ L', '4/3+ XL', '5/4+ M', '5/4+ L'],
      'Epic': ['3/2 S', '3/2 M', '3/2 L', '3/2 XL', '4/3 S', '4/3 M', '4/3 L', '4/3 XL'],
    },
    'Rip Curl': {
      Flashbomb: ['2mm S', '2mm M', '2mm L', '2mm XL', '3/2 S', '3/2 M', '3/2 L', '3/2 XL', '4/3 S', '4/3 M', '4/3 L', '4/3 XL', '5/3 M', '5/3 L', '5/3 XL'],
      'E-Bomb': ['3/2 S', '3/2 M', '3/2 L', '3/2 XL', '4/3 S', '4/3 M', '4/3 L', '4/3 XL'],
      Dawn: ['3/2 S', '3/2 M', '3/2 L', '3/2 XL', '4/3 M', '4/3 L', '4/3 XL'],
    },
    Billabong: {
      Furnace: ['2/2 S', '2/2 M', '2/2 L', '2/2 XL', '3/2 S', '3/2 M', '3/2 L', '3/2 XL', '4/3 S', '4/3 M', '4/3 L', '4/3 XL', '5/4 M', '5/4 L', '5/4 XL', '6/5 M', '6/5 L'],
      'Furnace Comp': ['3/2 S', '3/2 M', '3/2 L', '3/2 XL', '4/3 S', '4/3 M', '4/3 L', '4/3 XL'],
      Absolute: ['3/2 S', '3/2 M', '3/2 L', '3/2 XL', '4/3 S', '4/3 M', '4/3 L', '4/3 XL'],
    },
    Quiksilver: {
      Highline: ['3/2 S', '3/2 M', '3/2 L', '3/2 XL', '4/3 S', '4/3 M', '4/3 L', '4/3 XL'],
      Syncro: ['3/2 S', '3/2 M', '3/2 L', '3/2 XL', '4/3 S', '4/3 M', '4/3 L', '4/3 XL'],
    },
    Picture: {
      Equation: ['3/2 S', '3/2 MS', '3/2 M', '3/2 MT', '3/2 L', '3/2 XL', '4/3 S', '4/3 MS', '4/3 M', '4/3 MT', '4/3 L', '4/3 XL'],
      Dome: ['3/2 S', '3/2 M', '3/2 L', '3/2 XL', '4/3 S', '4/3 M', '4/3 L', '4/3 XL'],
    },
    Vissla: {
      'Seven Seas': ['2mm S', '2mm M', '2mm L', '2mm XL', '3/2 S', '3/2 M', '3/2 L', '3/2 XL', '4/3 M', '4/3 MT', '4/3 L', '4/3 LT', '4/3 XL', '5/4 M', '5/4 L', '5/4 XL'],
      '7 Seas Comp': ['3/2 S', '3/2 M', '3/2 L', '3/2 XL', '4/3 M', '4/3 L', '4/3 XL'],
    },
    'Soöruz': {
      Fighter: ['3/2 S', '3/2 M', '3/2 L', '3/2 XL', '4/3 S', '4/3 M', '4/3 L', '4/3 XL', '5/4/3 M', '5/4/3 L', '5/4/3 XL'],
      Guru: ['3/2 S', '3/2 M', '3/2 L', '3/2 XL', '4/3 S', '4/3 M', '4/3 L', '4/3 XL'],
      Divine: ['3/2 S', '3/2 M', '3/2 L', '3/2 XL', '4/3 M', '4/3 L', '4/3 XL'],
    },
    'Ion': {
      Seek: ['2mm S', '2mm M', '2mm L', '2mm XL', '3/2 S', '3/2 M', '3/2 L', '3/2 XL', '4/3 S', '4/3 M', '4/3 L', '4/3 XL', '5/4 M', '5/4 L', '5/4 XL'],
      Element: ['3/2 S', '3/2 M', '3/2 L', '3/2 XL', '4/3 S', '4/3 M', '4/3 L', '4/3 XL'],
    },
    'Prolimit': {
      Mercury: ['3/2 S', '3/2 M', '3/2 L', '3/2 XL', '4/3 S', '4/3 M', '4/3 L', '4/3 XL', '5/4/3 M', '5/4/3 L', '5/4/3 XL'],
      Fire: ['3/2 S', '3/2 M', '3/2 L', '3/2 XL', '4/3 S', '4/3 M', '4/3 L', '4/3 XL'],
    },
  },
} as const;

// Renamed to CatalogCategory to avoid clashing with the user-facing
// `GearCategory` type from `types/index.ts` (which uses singular form
// — `board`, `frontwing`… — for storage keys).
export type CatalogCategory = keyof typeof GEAR_CATALOG;
export type CatalogBrand<C extends CatalogCategory> = keyof (typeof GEAR_CATALOG)[C];

/**
 * Map the user-facing category (singular, used as the GearItem.category
 * value) to the catalog key (plural). Returns undefined when the category
 * has no catalog (e.g. "accessory" or "other") — callers should fall back
 * to free-text input.
 */
export function catalogKeyFor(category: string): CatalogCategory | undefined {
  const map: Record<string, CatalogCategory> = {
    board: 'boards',
    frontwing: 'frontwings',
    stab: 'stabs',
    fuselage: 'fuselages',
    mast: 'masts',
    wing: 'wings',
    leash: 'leashes',
    wetsuit: 'wetsuits',
  };
  return map[category];
}
