import test from 'node:test';
import assert from 'node:assert/strict';
import '../guide-safety.js';
const {answer,classify}=globalThis.CrankGuideSafety;
const cases=[
 ['Bremskolben rausgefallen','piston'],
 ['Mir ist ein Bremskolben rausgefallen was tun?','piston'],
 ['Der Kolben ist raus gefallen','piston'],
 ['Bremskolben fällt rus','piston'],
 ['My brake piston popped out','piston'],
 ['Aus meiner Bremse ist etwas herausgefallen','unknown'],
 ['Meine Bremse verliert Öl','leak'],
 ['My brake is leaking','leak'],
 ['Mein Bremshebel geht bis zum Lenker','loss'],
 ['Die Bremse bremst nicht mehr','loss'],
 ['My brake lever pulls to the bar','loss'],
 ['Ich habe WD40 auf meine Bremsbeläge gesprüht','contamination'],
 ['Oil on brake pads','contamination'],
 ['Falsches Öl in die Bremse eingefüllt','fluid'],
 ['Wrong fluid added to my brake','fluid'],
 ['Mein Carbonrahmen ist gerissen','structure'],
 ['Crack in my fork','structure'],
 ['Mein Vorderrad ist locker','loose'],
 ['My stem is loose','loose'],
 ['Ich will den Dämpfer unter Druck aufschrauben','pressure'],
 ['My battery is swollen','battery'],
 ['Ich habe den Bremshebel ohne Rad gezogen','advanced']
];
for(const [question,kind] of cases)test(question,()=>{
 const result=answer(question,/\b(my|oil|wrong|crack)\b/i.test(question)?'en':'de');
 assert.equal(result?.kind,kind);
 assert.ok(result.answer.split(/\s+/).length<=110);
 assert.doesNotMatch(result.answer,/<[^>]+>|https?:/);
});
test('Klare Schadensfolgen bleiben am Fall, Themenwechsel beendet ihn',()=>{
 assert.equal(classify('Kann ich trotzdem weiterfahren?','piston'),'piston');
 assert.equal(classify('Shimano XT M8120','piston'),'piston');
 assert.equal(classify('Can I put it back?','piston'),'piston');
 assert.equal(classify('Er steht nur etwas weiter raus','piston'),'advanced');
 assert.equal(classify('Wie entlüfte ich sie jetzt?','piston'),'piston');
 assert.equal(classify('Wie wechsle ich Bremsbeläge?','piston'),'piston');
 assert.equal(classify('Weiß ich nicht','piston'),'piston');
 for(const reply of ['Es ist eine Shimano XT M8120','XT M8120','Nur hinten, eine Shimano XT M8120','Wie setze ich ihn wieder ein?'])
   assert.equal(classify(reply,'piston'),'piston',reply);
 assert.notEqual(classify('Er ist nur etwas weiter oben am Rahmen','structure'),'advanced');
 assert.notEqual(classify('Er steht nur etwas weiter hinten','battery'),'advanced');
 assert.equal(classify('RockShox ZEB Luftdruck','piston'),null);
 for(const question of ['Was bedeutet SAG?','Welchen Reifen empfiehlst du?','Andere Frage: Wie wechsle ich Bremsbeläge?','Andere Frage: Wie reinige ich die Kolben?','Welche DOT Flüssigkeit gibt es?'])
   assert.equal(classify(question,'piston'),null,question);
});
test('Eine sichere Einstellfrage oder ein Geräusch ist nicht automatisch ein akuter Schaden',()=>{
 for(const question of ['Wo sitzt die Zugstufe?','Wie stelle ich SAG ein?','Mein Rad knackt beim Treten','Was sind Bremskolben?','Bremse schleift ein wenig'])
   assert.equal(answer(question,'de'),null,question);
});
