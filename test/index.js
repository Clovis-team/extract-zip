const extract = require('../')
const fs = require('fs-extra')
const os = require('os')
const path = require('path')
const test = require('ava')

const catsZip = path.join(__dirname, 'cats.zip')
const githubZip = path.join(__dirname, 'github.zip')
const noPermissionsZip = path.join(__dirname, 'no-permissions.zip')
const subdirZip = path.join(__dirname, 'file-in-subdir-without-subdir-entry.zip')
const symlinkDestZip = path.join(__dirname, 'symlink-dest.zip')
const symlinkZip = path.join(__dirname, 'symlink.zip')
const brokenZip = path.join(__dirname, 'broken.zip')
const accentsWindowsWinrarZip = path.join(__dirname, 'accents_windows_winrar.zip')
const accentsOsxWindowsZip = path.join(__dirname, 'accents_osx_windows.zip')
const accentsWindows7Zip = path.join(__dirname, 'accents_windows_7zip.zip')
const accentsOsxNative = path.join(__dirname, 'accents_osx_native.zip')

const relativeTarget = './cats'

async function mkdtemp (t, suffix) {
  return fs.mkdtemp(path.join(os.tmpdir(), `extract-zip-${suffix}`))
}

async function tempExtract (t, suffix, zipPath) {
  const dirPath = await mkdtemp(t, suffix)
  await extract(zipPath, { dir: dirPath })
  return dirPath
}

async function pathExists (t, pathToCheck, message) {
  const exists = await fs.pathExists(pathToCheck)
  t.true(exists, `${pathToCheck} ${message}`)
}

async function pathDoesntExist (t, pathToCheck, message) {
  const exists = await fs.pathExists(pathToCheck)
  t.false(exists, message)
}

async function assertPermissions (t, pathToCheck, expectedMode) {
  const stats = await fs.stat(pathToCheck)
  const actualMode = (stats.mode & 0o777)
  t.is(actualMode, expectedMode)
}

test('files', async t => {
  const dirPath = await tempExtract(t, 'files', catsZip)
  await pathExists(t, path.join(dirPath, 'cats', 'gJqEYBs.jpg'), 'file created')
})

test('windows winrar accents', async t => {
  const dirPath = await tempExtract(t, 'windows_accents_winrar', accentsWindowsWinrarZip)
  await pathExists(t, path.join(dirPath, 'Archive', 'àâæçéèêëïîôœùûüÿ'), 'directory created')
})

test('windows 7zip accents', async t => {
  const dirPath = await tempExtract(t, 'window_accents_7zip', accentsWindows7Zip)
  await pathExists(t, path.join(dirPath, 'Archive', 'àâæçéèêëïîôœùûüÿ'), 'directory created')
})

test('osx native accents', async t => {
  const dirPath = await tempExtract(t, 'osx_accents_native', accentsOsxNative)
  await pathExists(t, path.join(dirPath, 'Archive', 'àâæçéèêëïîôœùûüÿ'), 'directory created')
})

test('osx with windows chars accents', async t => {
  const dirPath = await tempExtract(t, 'accents_osx_windows', accentsOsxWindowsZip)
  console.log(dirPath)
  await pathExists(t, path.join(dirPath, '1. Data Room'), 'directory created')
  await pathExists(t, path.join(dirPath, '1. Data Room', '000 - Plans et surfaces Existant'), 'directory created')
  await pathExists(t, path.join(dirPath, '1. Data Room', '001 - DTA & Sécurité'), 'directory created')
  await pathExists(t, path.join(dirPath, '1. Data Room', '002 - DOE'), 'directory created')
  await pathExists(t, path.join(dirPath, '1. Data Room', '003 - Contrat d\'achat & sous-traitance maintenance'), 'directory created')
  await pathExists(t, path.join(dirPath, '1. Data Room', '004 - Exploitation'), 'directory created')
  await pathExists(t, path.join(dirPath, '1. Data Room', '005 - Energies'), 'directory created')
  await pathExists(t, path.join(dirPath, '1. Data Room', '006 - Rapport organisme de contrôle'), 'directory created')
  await pathExists(t, path.join(dirPath, '1. Data Room', '007 - Déchets'), 'directory created')
  await pathExists(t, path.join(dirPath, '1. Data Room', '008 - Espaces verts'), 'directory created')
  await pathExists(t, path.join(dirPath, '1. Data Room', '009 - Divers'), 'directory created')
  await pathExists(t, path.join(dirPath, '1. Data Room', '010 - GMAO'), 'directory created')
  await pathExists(t, path.join(dirPath, '1. Data Room', '011 - Plans électricité Campus'), 'directory created')
  await pathExists(t, path.join(dirPath, '1. Data Room', '012 - Accessibilité PMR'), 'directory created')
  await pathExists(t, path.join(dirPath, '1. Data Room', '013 - Fiches produits et références'), 'directory created')
  await pathExists(t, path.join(dirPath, '1. Data Room', '014 - Foudre'), 'directory created')
  await pathExists(t, path.join(dirPath, '1. Data Room', '015 - Listing matériel'), 'directory created')
  await pathExists(t, path.join(dirPath, '1. Data Room', '016 - Plans Camus HEC'), 'directory created')
  await pathExists(t, path.join(dirPath, '1. Data Room', '020 - Devis maintenance exploitation'), 'directory created')
  await pathExists(t, path.join(dirPath, '1. Data Room', '030 - Travaux d\'aménagement'), 'directory created')
  await pathExists(t, path.join(dirPath, '1. Data Room', '031 - Contrôle d\'accès et vidéo'), 'directory created')
  await pathExists(t, path.join(dirPath, '1. Data Room', '032 - SSI'), 'directory created')
  await pathExists(t, path.join(dirPath, '1. Data Room', '033 - VDI'), 'directory created')
  await pathExists(t, path.join(dirPath, '1. Data Room', '035 - Sinistres'), 'directory created')
  await pathExists(t, path.join(dirPath, '1. Data Room', '040 - Bâtiments rénovés'), 'directory created')
  await pathExists(t, path.join(dirPath, '1. Data Room', '045 - Désordres structurels ou de long terme'), 'directory created')
  await pathExists(t, path.join(dirPath, '1. Data Room', '050 - Processus'), 'directory created')
  await pathExists(t, path.join(dirPath, '1. Data Room', '080 - Phototèque'), 'directory created')
  await pathExists(t, path.join(dirPath, '1. Data Room', '090 - Audits'), 'directory created')
  await pathExists(t, path.join(dirPath, '1. Data Room', '100 - Réglementation'), 'directory created')
  await pathExists(t, path.join(dirPath, '1. Data Room', 'Archives'), 'directory created')
  await pathExists(t, path.join(dirPath, '2. Gestion de projet'), 'directory created')
  await pathExists(t, path.join(dirPath, '2. Gestion de projet', 'a. CR Comité Opérationnel'), 'directory created')
  await pathExists(t, path.join(dirPath, '2. Gestion de projet', 'b. CR Comité de Direction'), 'directory created')
  await pathExists(t, path.join(dirPath, '2. Gestion de projet', 'c. Autres'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.3 - Programmation'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.3 - Programmation', '3. Logement'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.3 - Programmation', '2. Bas Campus'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.3 - Programmation', '1. Haut Campus'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.3 - Programmation', '1. Haut Campus', 'a. Ateliers thématiques'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.2 -  Préprogrammation'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.2 -  Préprogrammation', '3. Logement'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.2 -  Préprogrammation', '3. Logement', 'a. Scenarii localisation'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.2 -  Préprogrammation', '2. Bas Campus'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.2 -  Préprogrammation', '2. Bas Campus', 'd. Module II'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.2 -  Préprogrammation', '2. Bas Campus', 'c. Module I'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.2 -  Préprogrammation', '2. Bas Campus', 'b. Recueil des besoins'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.2 -  Préprogrammation', '2. Bas Campus', 'a. Analye existant'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.2 -  Préprogrammation', '1. Haut Campus'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.2 -  Préprogrammation', '1. Haut Campus', 'a. Cadrage Stratégique et Synthèse des enjeux'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.2 -  Préprogrammation', '1. Haut Campus', 'b. Préprogramme V1'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.2 -  Préprogrammation', '1. Haut Campus', 'c. Chiffrage V1'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.2 -  Préprogrammation', '1. Haut Campus', 'd. Description surfaces'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.2 -  Préprogrammation', '1. Haut Campus', 'e. Effectifs'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.1 - Etudes'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.1 - Etudes', '1. Analyse de l\'existant'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.1 - Etudes', '1. Analyse de l\'existant', 'a. Diagnostic urbain'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.1 - Etudes', '1. Analyse de l\'existant', 'b. Diagnostic paysager'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.1 - Etudes', '1. Analyse de l\'existant', 'd. Analyse bâtimentaire'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.1 - Etudes', '1. Analyse de l\'existant', 'e. Etat des lieux Exploitation Maintenance'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.1 - Etudes', '1. Analyse de l\'existant', 'f. Analyse préprog existant'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.1 - Etudes', '2. Audits et Diagnostics'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.1 - Etudes', '2. Audits et Diagnostics', 'a. Analyse Data Room'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.1 - Etudes', '2. Audits et Diagnostics', 'b. Cahier des charges'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.1 - Etudes', '2. Audits et Diagnostics', 'c. Estimation chiffrage'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.1 - Etudes', '2. Audits et Diagnostics', 'd. Diagnostics'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.1 - Etudes', '2. Audits et Diagnostics', 'd. Diagnostics', '1. Géomètre'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.1 - Etudes', '2. Audits et Diagnostics', 'd. Diagnostics', '2. Géotechnique'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.1 - Etudes', '2. Audits et Diagnostics', 'd. Diagnostics', '3. Structure'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.1 - Etudes', '2. Audits et Diagnostics', 'd. Diagnostics', '4. Clos Couvert'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.1 - Etudes', '2. Audits et Diagnostics', 'd. Diagnostics', '5. Réseau'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.1 - Etudes', '2. Audits et Diagnostics', 'd. Diagnostics', '7. Amiante et plomb'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.1 - Etudes', '3. RSE'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.1 - Etudes', '3. RSE', 'a. Benchmark'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.1 - Etudes', '3. RSE', 'b. Charte'), 'directory created')
  await pathExists(t, path.join(dirPath, '3. Etudes Tranche Ferme', '3.1 - Etudes', '4. Plan-guide'), 'directory created')
  await pathExists(t, path.join(dirPath, '4. Etudes - Consultation'), 'directory created')
  await pathExists(t, path.join(dirPath, '4. Etudes - Consultation', '4.1 - Cahier de prescriptions'), 'directory created')
  await pathExists(t, path.join(dirPath, '4. Etudes - Consultation', '4.1 - Cahier de prescriptions', '1 - Cahier de prescriptions urbaines'), 'directory created')
  await pathExists(t, path.join(dirPath, '4. Etudes - Consultation', '4.1 - Cahier de prescriptions', '2 - Cahier de prescriptions architecturales'), 'directory created')
  await pathExists(t, path.join(dirPath, '4. Etudes - Consultation', '4.1 - Cahier de prescriptions', '3 - Cahier de prescriptions paysagères'), 'directory created')
  await pathExists(t, path.join(dirPath, '4. Etudes - Consultation', '4.1 - Cahier de prescriptions', '4 - Cahier de prescriptions environnementales'), 'directory created')
  await pathExists(t, path.join(dirPath, '4. Etudes - Consultation', '4.2 - Consultation'), 'directory created')
  await pathExists(t, path.join(dirPath, '4. Etudes - Consultation', '4.2 - Consultation', '0 - Synthèse'), 'directory created')
  await pathExists(t, path.join(dirPath, '4. Etudes - Consultation', '4.2 - Consultation', '1 - Documents'), 'directory created')
  await pathExists(t, path.join(dirPath, '4. Etudes - Consultation', '4.2 - Consultation', '1 - Documents', 'a. Appel à candidatures'), 'directory created')
  await pathExists(t, path.join(dirPath, '4. Etudes - Consultation', '4.2 - Consultation', '1 - Documents', 'b. Appel à projets'), 'directory created')
  await pathExists(t, path.join(dirPath, '4. Etudes - Consultation', '4.2 - Consultation', '2 - Critères de notations'), 'directory created')
})

test('symlinks', async t => {
  const dirPath = await tempExtract(t, 'symlinks', catsZip)
  const symlink = path.join(dirPath, 'cats', 'orange_symlink')

  await pathExists(t, path.join(dirPath, 'cats'), 'directory created')
  await pathExists(t, symlink, `symlink created: ${symlink}`)

  const stats = await fs.lstat(symlink)
  t.truthy(stats.isSymbolicLink(), 'symlink is valid')
  const linkPath = await fs.readlink(symlink)
  t.is(linkPath, 'orange')
})

test('directories', async t => {
  const dirPath = await tempExtract(t, 'directories', catsZip)
  const dirWithContent = path.join(dirPath, 'cats', 'orange')
  const dirWithoutContent = path.join(dirPath, 'cats', 'empty')

  await pathExists(t, dirWithContent, 'directory created')

  const filesWithContent = await fs.readdir(dirWithContent)
  t.not(filesWithContent.length, 0, 'directory has files')

  await pathExists(t, dirWithoutContent, 'empty directory created')

  const filesWithoutContent = await fs.readdir(dirWithoutContent)
  t.is(filesWithoutContent.length, 0, 'empty directory has no files')
})

test('verify github zip extraction worked', async t => {
  const dirPath = await tempExtract(t, 'verify-extraction', githubZip)
  await pathExists(t, path.join(dirPath, 'extract-zip-master', 'test'), 'folder created')
  if (process.platform !== 'win32') {
    await assertPermissions(t, path.join(dirPath, 'extract-zip-master', 'test'), 0o755)
  }
})

test('opts.onEntry', async t => {
  const dirPath = await mkdtemp(t, 'onEntry')
  const actualEntries = []
  const expectedEntries = [
    'symlink/',
    'symlink/foo.txt',
    'symlink/foo_symlink.txt'
  ]
  const onEntry = function (entry) {
    actualEntries.push(entry.fileName)
  }
  await extract(symlinkZip, { dir: dirPath, onEntry })
  t.deepEqual(actualEntries, expectedEntries, 'entries should match')
})

test('relative target directory', async t => {
  await fs.remove(relativeTarget)
  await t.throwsAsync(extract(catsZip, { dir: relativeTarget }), {
    message: 'Target directory is expected to be absolute'
  })
  await pathDoesntExist(t, path.join(__dirname, relativeTarget), 'folder not created')
  await fs.remove(relativeTarget)
})

if (process.platform !== 'win32') {
  test('symlink destination disallowed', async t => {
    const dirPath = await mkdtemp(t, 'symlink-destination-disallowed')
    await pathDoesntExist(t, path.join(dirPath, 'file.txt'), "file doesn't exist at symlink target")

    await t.throwsAsync(extract(symlinkDestZip, { dir: dirPath }), {
      message: /Out of bound path ".*?" found while processing file symlink-dest\/aaa\/file.txt/
    })
  })

  test('no file created out of bound', async t => {
    const dirPath = await mkdtemp(t, 'out-of-bounds-file')
    await t.throwsAsync(extract(symlinkDestZip, { dir: dirPath }))

    const symlinkDestDir = path.join(dirPath, 'symlink-dest')

    await pathExists(t, symlinkDestDir, 'target folder created')
    await pathExists(t, path.join(symlinkDestDir, 'aaa'), 'symlink created')
    await pathExists(t, path.join(symlinkDestDir, 'ccc'), 'parent folder created')
    await pathDoesntExist(t, path.join(symlinkDestDir, 'ccc/file.txt'), 'file not created in original folder')
    await pathDoesntExist(t, path.join(dirPath, 'file.txt'), 'file not created in symlink target')
  })

  test('defaultDirMode', async t => {
    const dirPath = await mkdtemp(t, 'default-dir-mode')
    const defaultDirMode = 0o700
    await extract(githubZip, { dir: dirPath, defaultDirMode })
    await assertPermissions(t, path.join(dirPath, 'extract-zip-master', 'test'), defaultDirMode)
  })

  test('defaultFileMode not set', async t => {
    const dirPath = await mkdtemp(t, 'default-file-mode')
    await extract(noPermissionsZip, { dir: dirPath })
    await assertPermissions(t, path.join(dirPath, 'folder', 'file.txt'), 0o644)
  })

  test('defaultFileMode', async t => {
    const dirPath = await mkdtemp(t, 'default-file-mode')
    const defaultFileMode = 0o600
    await extract(noPermissionsZip, { dir: dirPath, defaultFileMode })
    await assertPermissions(t, path.join(dirPath, 'folder', 'file.txt'), defaultFileMode)
  })
}

test('files in subdirs where the subdir does not have its own entry is extracted', async t => {
  const dirPath = await tempExtract(t, 'subdir-file', subdirZip)
  await pathExists(t, path.join(dirPath, 'foo', 'bar'), 'file created')
})

test('extract broken zip', async t => {
  const dirPath = await mkdtemp(t, 'broken-zip')
  await t.throwsAsync(extract(brokenZip, { dir: dirPath }), {
    message: 'invalid central directory file header signature: 0x2014b00'
  })
})
