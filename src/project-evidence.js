// Owner confirmation: reports/project-photos-local-2026-10-12/真实案例照片更新.md.
// Conversion mapping: prepare-images.mjs in that report directory. No location,
// customer identity, measured outcome or blanket rights clearance is inferred.
const image=(name,alt,caption,height)=>({
 src:'/assets/projects/confirmed-'+name+'-1000.webp',
 srcSet:'/assets/projects/confirmed-'+name+'-600.webp 600w, /assets/projects/confirmed-'+name+'-1000.webp 1000w',
 alt,caption,width:1000,height,
});
const gutter={
 project:true,
 title:'Property drainage channel clearing',
 intro:'We cleared accumulated debris from the property’s roof drainage channel. These site photographs show the build-up and the cleared channel.',
 relatedPath:'/services/gutter-downpipe-maintenance',relatedLabel:'Gutter cleaning and downpipe maintenance',
 images:[
  image('gutter-before','Grass and debris accumulated in a property roof drainage channel','Before clearing: vegetation and debris in the drainage channel.',1777),
  image('gutter-cleared','Property roof drainage channel after accumulated debris was cleared','The drainage channel after debris clearing.',1777),
 ],
};
export const PROJECT_GALLERIES={
 'emergency-roof-repairs':{
  project:true,title:'Urgent roof leak work',
  intro:'We attended an urgent roof leak and addressed the roof water-entry problem. This project collage records the site condition and work stages.',
  images:[
   {src:'/assets/projects/urgent-before-edge.webp',width:466,height:338,alt:'Roof edge and debris in the gutter before work',caption:'Before: roof edge and gutter condition.'},
   {src:'/assets/projects/urgent-before-channel.webp',width:477,height:330,alt:'Roof tiles and drainage channel before work',caption:'Before: roof tiles and drainage channel.'},
   {src:'/assets/projects/urgent-before-junction.webp',width:477,height:335,alt:'Roof junction and accumulated debris before work',caption:'Before: roof junction and accumulated debris.'},
   {src:'/assets/projects/urgent-during-work.webp',width:463,height:550,alt:'Roof edge with equipment during the urgent leak job',caption:'In process: roof edge during work.'},
   {src:'/assets/projects/urgent-after-channel.webp',width:473,height:542,alt:'Roof drainage channel shown in the final project photograph',caption:'After: drainage channel recorded in the project collage.'},
  ],
 },
 'rental-property-roof-repairs':{
  project:true,title:'Property roof inspection and crack repairs',
  intro:'For this property maintenance project, we inspected the supporting layer beneath rooftop equipment and repaired cracking in the roof area.',
  images:[
   image('property-equipment-detail','Close-up of a rooftop equipment enclosure and adjoining metal roof','Equipment enclosure and adjoining roof detail recorded during the project.',1778),
   image('property-equipment-roof','Rooftop equipment enclosures and surrounding metal roof areas','Rooftop equipment and surrounding roof areas inspected for the property project.',1778),
   image('property-roof-work','Rooftop equipment, roof junctions and surrounding roof surface','Roof and equipment junctions documented during the inspection and repair project.',563),
  ],
 },
 'gutter-repairs':gutter,
 'gutter-downpipe-maintenance':gutter,
};
