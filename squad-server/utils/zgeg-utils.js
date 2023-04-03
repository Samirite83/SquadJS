// TODO Test avec quelques players
// TODO Prise en compte des véhicule ?

export class Match {
  constructor(
    id,
    startTime,
    endTime,
    matchTimeout,
    isFinished,
    isDraw,
    isSeed,
    layerInfo,
    teams,
    layerName
  ) {
    this.id = id;
    this.startTime = startTime;
    this.endTime = endTime;
    this.matchTimeout = matchTimeout;
    this.isFinished = isFinished;
    this.isDraw = isDraw;
    this.isSeed = isSeed;
    this.layerInfo = layerInfo;
    this.teams = teams;
    this.layerName = layerName;
  }
}

export class Team {
  constructor(
    id,
    teamID,
    teamName,
    teamFaction,
    startTickets,
    killCount,
    deathCount,
    incapCount,
    reviveCount,
    kdr,
    idr,
    rir,
    scoreInf,
    scoreBully,
    ticketsLive,
    endTickets,
    otherLossTickets,
    finalScore,
    match,
    squads,
    kills,
    incaps,
    revives,
    hasWon,
    deaths,
    incapVictimCount
  ) {
    this.id = id;
    this.teamID = teamID;
    this.teamName = teamName;
    this.teamFaction = teamFaction;
    this.startTickets = startTickets;
    this.killCount = killCount;
    this.deathCount = deathCount;
    this.incapCount = incapCount;
    this.reviveCount = reviveCount;
    this.kdr = kdr;
    this.idr = idr;
    this.rir = rir;
    this.scoreInf = scoreInf;
    this.scoreBully = scoreBully;
    this.ticketsLive = ticketsLive;
    this.endTickets = endTickets;
    this.otherLossTickets = otherLossTickets;
    this.finalScore = finalScore;
    this.match = match;
    this.squads = squads;
    this.kills = kills;
    this.incaps = incaps;
    this.revives = revives;
    this.hasWon = hasWon;
    this.deaths = deaths;
    this.incapVictimCount = incapVictimCount;
  }
}

export class Squad {
  constructor(
    id,
    squadID,
    squadName,
    isLocked,
    killCount,
    deathCount,
    incapCount,
    reviveCount,
    kdr,
    idr,
    rir,
    scoreInf,
    finalScore,
    team,
    match,
    players,
    kills,
    incaps,
    revives,
    creator,
    deaths,
    incapVictimCount
  ) {
    this.id = id;
    this.squadID = squadID;
    this.squadName = squadName;
    this.isLocked = isLocked;
    this.killCount = killCount;
    this.deathCount = deathCount;
    this.incapCount = incapCount;
    this.reviveCount = reviveCount;
    this.kdr = kdr;
    this.idr = idr;
    this.rir = rir;
    this.scoreInf = scoreInf;
    this.finalScore = finalScore;
    this.team = team;
    this.match = match;
    this.players = players;
    this.kills = kills;
    this.incaps = incaps;
    this.revives = revives;
    this.creator = creator;
    this.deaths = deaths;
    this.incapVictimCount = incapVictimCount;
  }
}

export class LayerInfo {
  constructor(name, classname, map, gamemode, numerOfCapturePoints) {
    this.name = name;
    this.classname = classname;
    this.map = map;
    this.gamemode = gamemode;
    this.numerOfCapturePoints = numerOfCapturePoints;
  }
}

export class Player {
  constructor(
    playerID,
    name,
    suffix,
    isPlaying,
    lastWeapon,
    steamID,
    lastAttacker,
    killCount,
    deathCount,
    incapCount,
    reviveCount,
    globalKdr,
    globalIdr,
    kills,
    incapsAttacker,
    revives,
    matches,
    user,
    squadsCreated,
    incapsVictim,
    deaths,
    currentSquad,
    revivesBy,
    guildTag,
    currentTeam,
    globalKir,
    globalIir,
    incapVictimCount
  ) {
    this.playerID = playerID;
    this.name = name;
    this.suffix = suffix;
    this.isPlaying = isPlaying;
    this.lastWeapon = lastWeapon;
    this.steamID = steamID;
    this.lastAttacker = lastAttacker;
    this.killCount = killCount;
    this.deathCount = deathCount;
    this.incapCount = incapCount;
    this.reviveCount = reviveCount;
    this.globalKdr = globalKdr;
    this.globalIdr = globalIdr;
    this.kills = kills;
    this.incapsAttacker = incapsAttacker;
    this.revives = revives;
    this.matches = matches;
    this.user = user;
    this.squadsCreated = squadsCreated;
    this.incapsVictim = incapsVictim;
    this.deaths = deaths;
    this.currentSquad = currentSquad;
    this.revivesBy = revivesBy;
    this.guildTag = guildTag;
    this.currentTeam = currentTeam;
    this.globalKir = globalKir;
    this.globalIir = globalIir;
    this.incapVictimCount = incapVictimCount;
  }
}

export async function getPlayerIdBySteamId(strapi, steamID, info) {
  let res = await strapi.find('players', {
    filters: {
      steamID: {
        $eq: steamID
      }
    }
  });
  let playerId = null;
  if (!res.data[0] && info) {
    res = await strapi.create('players', {
      name: info.player.suffix,
      suffix: info.player.suffix,
      isPlaying: true,
      lastWeapon: '',
      steamID: steamID,
      lastAttacker: null,
      killCount: 0,
      deathCount: 0,
      incapCount: 0,
      reviveCount: 0,
      globalKdr: 0,
      globalIdr: 0,
      kills: null,
      incapsAttacker: null,
      revives: null,
      matches: null,
      user: null,
      squadsCreated: null,
      incapsVictim: null,
      deaths: null,
      currentSquad: null,
      revivesBy: null,
      guildTag: null,
      currentTeam: null,
      globalKir: null,
      globalIir: null,
      incapVictimCount: 0,
      revivedCount: 0
    });
    playerId = res.data.id;
  } else {
    playerId = res.data[0].id;
  }
  return playerId;
}

export async function getSquadBySquadId(strapi, squadID, team, match) {
  const res = await strapi.find('squads', {
    fields: ['id'],
    sort: 'id:desc',
    pagination: { start: 0, limit: 1 },
    filters: { squadID: { $eq: squadID } },
    populate: {
      team: { filters: { id: { $eq: team.id } }, fields: ['id'] },
      match: { filters: { id: { $eq: match.id } }, fields: ['id'] }
    }
  });
  return res.data.length !== 0 ? res.data[0].id : null;
}

export async function getLayerinfoIdByClassname(strapi, classname) {
  const res = await strapi.find('layerinfos', {
    filters: {
      classname: { $eq: classname }
    }
  });
  let layerinfo = null;
  if (res.data[0]) {
    layerinfo = res.data[0].id;
  } else {
    layerinfo = await strapi.create('layerinfos', {
      classname: classname
    });
    layerinfo = layerinfo.data.id;
  }
  return layerinfo;
}

export async function getLastMatch(strapi) {
  const res = await strapi.find('matches', {
    sort: 'id:desc',
    populate: {
      teams: { fields: ['id', 'teamID'], sort: 'teamID:asc' },
      layerinfo: { fields: ['id'] }
    },
    pagination: {
      start: 0,
      limit: 1
    }
  });
  if (res.data[0]) {
    const layerinfo = res.data[0].attributes.layerinfo.data
      ? res.data[0].attributes.layerinfo.data.id
      : await getLayerinfoIdByClassname(strapi, res.data[0].attributes.layerName);
    let team1 = null;
    let team2 = null;
    if (res.data[0].attributes.teams.data[0] && res.data[0].attributes.teams.data[1]) {
      team1 = res.data[0].attributes.teams.data[0].id;
      team2 = res.data[0].attributes.teams.data[1].id;
    }

    const match = new Match(
      res.data[0].id,
      res.data[0].attributes.startTime,
      res.data[0].attributes.endTime,
      res.data[0].attributes.matchTimeout,
      res.data[0].attributes.isFinished,
      res.data[0].attributes.isDraw,
      res.data[0].attributes.isSeed,
      layerinfo,
      team1 && team2 ? [team1, team2] : null,
      res.data[0].attributes.layerName
    );
    return match;
  }
  return null;
}

export async function getTeamById(strapi, teamId) {
  const res = await strapi.findOne('teams', teamId, {
    populate: {
      match: { fields: ['id'] },
      squads: { fields: ['id'] },
      kills: { fields: ['id'] },
      incaps: { fields: ['id'] },
      revives: { fields: ['id'] },
      deaths: { fields: ['id'] }
    }
  });
  const match = res.data.attributes.match.data.id;
  const squads = res.data.attributes.squads.data.map((squad) => squad.id);
  const kills = res.data.attributes.kills.data.map((kill) => kill.id);
  const incaps = res.data.attributes.incaps.data.map((incap) => incap.id);
  const revives = res.data.attributes.revives.data.map((revive) => revive.id);
  const deaths = res.data.attributes.deaths.data.map((death) => death.id);
  const team = new Team(
    res.data.id,
    res.data.attributes.teamID,
    res.data.attributes.teamName,
    res.data.attributes.teamFaction,
    res.data.attributes.startTickets,
    res.data.attributes.killCount,
    res.data.attributes.deathCount,
    res.data.attributes.incapCount,
    res.data.attributes.reviveCount,
    res.data.attributes.kdr,
    res.data.attributes.idr,
    res.data.attributes.rir,
    res.data.attributes.scoreInf,
    res.data.attributes.scoreBully,
    res.data.attributes.ticketsLive,
    res.data.attributes.endTickets,
    res.data.attributes.otherLossTickets,
    res.data.attributes.finalScore,
    match,
    squads,
    kills,
    incaps,
    revives,
    res.data.attributes.hasWon,
    deaths,
    res.data.attributes.incapVictimCount
  );
  return team;
}

export async function getTeamByMatch(strapi, teamID, match) {
  let res = await strapi.findOne('teams', match.teams[0]);
  let team = null;
  if (parseInt(teamID) === res.data.attributes.teamID) {
    team = await getTeamById(strapi, res.data.id);
  } else {
    res = await strapi.findOne('teams', match.teams[1]);
    team = await getTeamById(strapi, res.data.id);
  }
  return team;
}

export async function removePlayerFromSquad(strapi, playerId, squadId) {
  const res = await strapi.findOne('squads', squadId, {
    populate: { players: { fields: ['id'] } }
  });
  const playersId = res.data.attributes.players.data.map((player) => player.id);
  playersId.splice(playersId.indexOf(playerId), 1);
  await strapi.update('squads', squadId, {
    players: playersId
  });
}

export async function getPlayerCurrentSquad(strapi, playerId) {
  const res = await strapi.findOne('players', playerId, {
    populate: { currentSquad: { fields: ['id'] } }
  });
  return res.data.attributes.currentSquad.data ? res.data.attributes.currentSquad.data.id : null;
}

export async function setPlayerCurrentTeam(strapi, playerid, teamId) {
  strapi.update('players', playerid, {
    currentTeam: teamId
  });
}

export async function setPlayerCurrentSquad(strapi, playerId, squadId) {
  await strapi.update('players', playerId, {
    currentSquad: squadId
  });
}

export async function setAttackerLastWeapon(strapi, weapon, attackerId) {
  await strapi.update('players', attackerId, {
    lastWeapon: weapon
  });
}

export async function setVictimLastAttacker(strapi, victimId, attackerId) {
  await strapi.update('players', victimId, {
    lastAttacker: attackerId
  });
}

export async function getVictimLastAttacker(strapi, victimId) {
  const res = await strapi.findOne('players', victimId, {
    populate: { lastAttacker: { fields: ['id'] } }
  });
  return res.data.attributes.lastAttacker.data ? res.data.attributes.lastAttacker.data.id : null;
}

export async function updateLayerInfo(
  strapi,
  name,
  map,
  gamemode,
  numberOfCapturePoints,
  classname
) {
  const res = await strapi.find('layerinfos', {
    filters: { classname: { $eq: classname } },
    fields: ['id']
  });
  if (res.data.length !== 0) {
    await strapi.update('layerinfos', res.data[0].id, {
      name: name,
      map: map,
      gamemode: gamemode,
      numberOfCapturePoints: parseInt(numberOfCapturePoints)
    });
  }
}

export async function createNewSquad(
  strapi,
  squadID,
  squadName,
  isLocked,
  teamId,
  matchId,
  players,
  creatorId
) {
  const squad = new Squad(
    null,
    squadID,
    squadName,
    isLocked,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    teamId,
    matchId,
    players,
    null,
    null,
    null,
    creatorId,
    null,
    0
  );

  const res = await strapi.create('squads', {
    squadID: squad.squadID,
    squadName: squad.squadName,
    isLocked: squad.isLocked,
    killCount: squad.killCount,
    deathCount: squad.deathCount,
    incapCount: squad.incapCount,
    reviveCount: squad.reviveCount,
    kdr: squad.kdr,
    idr: squad.idr,
    rir: squad.rir,
    scoreInf: squad.scoreInf,
    finalScore: squad.finalScore,
    team: squad.team,
    match: squad.match,
    players: squad.players,
    kills: squad.kills,
    incaps: squad.incaps,
    revives: squad.revives,
    creator: squad.creator,
    deaths: squad.deaths,
    incapVictimCount: squad.incapVictimCount
  });
  return res.data.id;
}

export async function addSquadToCreator(strapi, playerId, squadId) {
  const res = await strapi.findOne('players', playerId, {
    populate: { squadsCreated: { fields: ['id'] } }
  });
  const squadIds = res.data.attributes.squadsCreated.data.map((squad) => squad.id);
  squadIds.push(squadId);
  await strapi.update('players', playerId, {
    squadsCreated: squadIds
  });
}

export async function addSquadToTeam(strapi, squadId, teamId) {
  const res = await strapi.findOne('teams', teamId, {
    populate: { squads: { fields: ['id'] } }
  });
  const squadIds = res.data.attributes.squads.data.map((squad) => squad.id);
  squadIds.push(squadId);
  await strapi.update('teams', teamId, {
    squads: squadIds
  });
}

export async function createNewTeams(strapi, match, currentLayer) {
  const team1 = new Team(
    null,
    1,
    currentLayer ? currentLayer.teams[0].name : 'TBD',
    currentLayer ? currentLayer.teams[0].faction : 'TBD',
    currentLayer ? currentLayer.teams[0].tickets : null,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    currentLayer ? currentLayer.teams[0].tickets : null,
    null,
    0,
    0,
    match.id,
    null,
    null,
    null,
    null,
    null,
    null,
    0
  );
  const team2 = new Team(
    null,
    2,
    currentLayer ? currentLayer.teams[1].name : 'TBD',
    currentLayer ? currentLayer.teams[1].faction : 'TBD',
    currentLayer ? currentLayer.teams[1].tickets : null,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    currentLayer ? currentLayer.teams[1].tickets : null,
    null,
    0,
    0,
    match.id,
    null,
    null,
    null,
    null,
    null,
    null,
    0
  );

  let res = await strapi.create('teams', {
    teamID: team1.teamID,
    teamName: team1.teamName,
    teamFaction: team1.teamFaction,
    startTickets: team1.startTickets,
    killCount: team1.killCount,
    deathCount: team1.deathCount,
    incapCount: team1.incapCount,
    reviveCount: team1.reviveCount,
    kdr: team1.kdr,
    idr: team1.idr,
    rir: team1.rir,
    scoreInf: team1.scoreInf,
    scoreBully: team1.scoreBully,
    ticketsLive: team1.ticketsLive,
    endTickets: team1.endTickets,
    otherLossTickets: team1.otherLossTickets,
    finalScore: team1.finalScore,
    match: team1.match,
    squads: team1.squads,
    kills: team1.kills,
    incaps: team1.incaps,
    revives: team1.revives,
    hasWon: team1.hasWon,
    deaths: team1.deaths,
    incapVictimCount: team1.incapVictimCount
  });

  team1.id = res.data.id;

  res = await strapi.create('teams', {
    teamID: team2.teamID,
    teamName: team2.teamName,
    teamFaction: team2.teamFaction,
    startTickets: team2.startTickets,
    killCount: team2.killCount,
    deathCount: team2.deathCount,
    incapCount: team2.incapCount,
    reviveCount: team2.reviveCount,
    kdr: team2.kdr,
    idr: team2.idr,
    rir: team2.rir,
    scoreInf: team2.scoreInf,
    scoreBully: team2.scoreBully,
    ticketsLive: team2.ticketsLive,
    endTickets: team2.endTickets,
    otherLossTickets: team2.otherLossTickets,
    finalScore: team2.finalScore,
    match: team2.match,
    squads: team2.squads,
    kills: team2.kills,
    incaps: team2.incaps,
    revives: team2.revives,
    hasWon: team2.hasWon,
    deaths: team2.deaths,
    incapVictimCount: team2.incapVictimCount
  });

  team2.id = res.data.id;

  strapi.update('matched', match.id, {
    teams: [team1.id, team2.id]
  });

  return [team1, team2];
}

export async function createMatchInDB(strapi, match) {
  const res = await strapi.create('matches', {
    startTime: match.startTime,
    endTime: match.endTime,
    matchTimeout: match.matchTimeout,
    isFinished: match.isFinished,
    isDraw: match.isDraw,
    isSeed: match.isSeed,
    layerInfo: match.layerInfo,
    teams: match.teams,
    layerName: match.layerName
  });
  match.id = res.data.id;
}

export async function addMatchToServer(strapi, serverId, match) {
  const res = await strapi.findOne('servers', serverId, {
    populate: { matches: { fields: ['id'] } }
  });

  const matchIds = res.data.attributes.matches.data.map((match) => match.id);
  matchIds.push(match.id);
  await strapi.update('servers', serverId, {
    matches: matchIds
  });
}

export async function addMatchToPlayer(strapi, playerId, matchId) {
  const res = await strapi.findOne('players', playerId, {
    populate: { matches: { fields: ['id'] } }
  });
  const matchIds = res.data.attributes.matches.data.map((match) => match.id);
  matchIds.push(matchId);

  await strapi.update('players', playerId, {
    matches: matchIds
  });
}

export async function addTeamsToMatch(strapi, team1, team2, match) {
  strapi.update('matches', match.id, {
    teams: [team1, team2]
  });
  match.teams = [team1, team2];
}

export function addLayerToMatch(strapi, layer, match) {
  strapi.update('matches', match, {
    layerinfo: layer
  });
}

export async function addIncapToAttacker(strapi, incapId, attackerId, isLive) {
  const res = await strapi.findOne('players', attackerId, {
    fields: ['incapCount'],
    populate: { incaps: { fields: ['id'] } }
  });
  const incaps = res.data.attributes.incaps.data.map((incap) => incap.id);
  const incapsCount = parseInt(res.data.attributes.incapCount);
  incaps.push(incapId);
  await strapi.update('players', attackerId, {
    incaps: incaps,
    incapCount: isLive ? incapsCount + 1 : incapsCount
  });
  if (isLive) {
    await updatePlayerScore(strapi, attackerId);
  }
}

export async function addIncapToVictim(strapi, incapId, victimId, isLive) {
  const res = await strapi.findOne('players', victimId, {
    fields: ['incapVictimCount'],
    populate: { incapsVictim: { fields: ['id'] } }
  });
  const incaps = res.data.attributes.incapsVictim.data.map((incap) => incap.id);
  const incapsCount = parseInt(res.data.attributes.incapVictimCount);
  incaps.push(incapId);
  await strapi.update('players', victimId, {
    incapsVictim: incaps,
    incapVictimCount: isLive ? incapsCount + 1 : res.data.attributes.incapVictimCount
  });
  if (isLive) {
    await updatePlayerScore(strapi, victimId);
  }
}

export async function updateTeamIncapCount(strapi, teamId, isLive) {
  if (!isLive) {
    return;
  }
  const res = await strapi.findOne('teams', teamId, {
    fields: ['incapCount']
  });
  const incapsCount = parseInt(res.data.attributes.incapCount);
  await strapi.update('teams', teamId, {
    incapCount: incapsCount + 1
  });
  await updateTeamScore(strapi, teamId);
}

export async function updateTeamIncapVictimCount(strapi, teamId, isLive) {
  if (!isLive) {
    return;
  }
  const res = await strapi.findOne('teams', teamId, {
    fields: ['incapVictimCount']
  });
  const incapsCount = parseInt(res.data.attributes.incapVictimCount);
  await strapi.update('teams', teamId, {
    incapVictimCount: incapsCount + 1
  });
  await updateTeamScore(strapi, teamId);
}

export async function updateSquadIncapCount(strapi, squadId, isLive) {
  if (!isLive) {
    return;
  }
  const res = await strapi.findOne('squads', squadId, {
    fields: ['incapCount']
  });
  const incapsCount = parseInt(res.data.attributes.incapCount);
  await strapi.update('squads', squadId, {
    incapCount: incapsCount + 1
  });
  await updateSquadScore(strapi, squadId);
}

export async function updateSquadIncapVictimCount(strapi, squadId, isLive) {
  if (!isLive) {
    return;
  }
  const res = await strapi.findOne('squads', squadId, {
    fields: ['incapVictimCount']
  });
  const incapsCount = parseInt(res.data.attributes.incapVictimCount);
  await strapi.update('squads', squadId, {
    incapVictimCount: incapsCount + 1
  });
  await updateSquadScore(strapi, squadId);
}

export async function addDeathToVictim(strapi, deathId, victimId, isLive) {
  const res = await strapi.findOne('players', victimId, {
    fields: ['deathCount'],
    populate: { deaths: { fields: ['id'] } }
  });
  const deaths = res.data.attributes.deaths.data.map((death) => death.id);
  const deathCount = parseInt(res.data.attributes.deathCount);
  deaths.push(deathId);
  await strapi.update('players', victimId, {
    deaths: deaths,
    deathCount: isLive ? deathCount + 1 : deathCount
  });
  if (isLive) {
    await updatePlayerScore(strapi, victimId);
  }
}

export async function addDeathToTeam(strapi, deathId, teamId, isLive) {
  const res = await strapi.findOne('teams', teamId, {
    fields: ['deathCount'],
    populate: { deaths: { fields: ['id'] } }
  });
  const deaths = res.data.attributes.deaths.data.map((death) => death.id);
  const deathCount = parseInt(res.data.attributes.deathCount);
  deaths.push(deathId);
  await strapi.update('teams', teamId, {
    deathCount: isLive ? deathCount + 1 : deathCount,
    deaths: deaths
  });
  if (isLive) {
    await updateTeamScore(strapi, teamId);
  }
}

export async function addDeathToSquad(strapi, deathId, squadId, isLive) {
  const res = await strapi.findOne('squads', squadId, {
    fields: ['deathCount'],
    populate: { deaths: { fields: ['id'] } }
  });
  const deaths = res.data.attributes.deaths.data.map((death) => death.id);
  const deathCount = parseInt(res.data.attributes.deathCount);
  deaths.push(deathId);
  await strapi.update('squads', squadId, {
    deathCount: isLive ? deathCount + 1 : deathCount,
    deaths: deaths
  });
  if (isLive) {
    await updateSquadScore(strapi, squadId);
  }
}

export async function addKillToAttacker(strapi, killId, attackerId, isLive) {
  const res = await strapi.findOne('players', attackerId, {
    fields: ['killCount'],
    populate: { kills: { fields: ['id'] } }
  });
  const kills = res.data.attributes.kills.data.map((kill) => kill.id);
  const killCount = parseInt(res.data.attributes.killCount);
  kills.push(killId);
  await strapi.update('players', attackerId, {
    kills: kills,
    killCount: isLive ? killCount + 1 : killCount
  });
  if (isLive) {
    await updatePlayerScore(strapi, attackerId);
  }
}

export async function addKillToTeam(strapi, killId, teamId, isLive) {
  const res = await strapi.findOne('teams', teamId, {
    fields: ['killCount'],
    populate: { kills: { fields: ['id'] } }
  });
  const kills = res.data.attributes.kills.data.map((kill) => kill.id);
  const killCount = parseInt(res.data.attributes.killCount);
  kills.push(killId);
  await strapi.update('teams', teamId, {
    kills: kills,
    killCount: isLive ? killCount + 1 : killCount
  });
  if (isLive) {
    await updateTeamScore(strapi, teamId);
  }
}

export async function addKillToSquad(strapi, killId, squadId, isLive) {
  const res = await strapi.findOne('squads', squadId, {
    fields: ['killCount'],
    populate: { kills: { fields: ['id'] } }
  });
  const kills = res.data.attributes.kills.data.map((death) => death.id);
  const killCount = parseInt(res.data.attributes.killCount);
  kills.push(killId);
  await strapi.update('squads', squadId, {
    kills: kills,
    killCount: isLive ? killCount + 1 : killCount
  });
  if (isLive) {
    await updateSquadScore(strapi, squadId);
  }
}

export async function addReviveToReviver(strapi, reviveId, reviverId, isLive) {
  const res = await strapi.findOne('players', reviverId, {
    fields: ['reviveCount'],
    populate: { revives: { fields: ['id'] } }
  });
  const reviveCount = parseInt(res.data.attributes.reviveCount);
  const revives = res.data.attributes.revives.data.map((rev) => rev.id);
  revives.push(reviveId);
  await strapi.update('players', reviverId, {
    revives: revives,
    reviveCount: isLive ? reviveCount + 1 : reviveCount
  });
  if (isLive) {
    await updatePlayerScore(strapi, reviverId);
  }
}

export async function addReviveToVictim(strapi, reviveId, victimid) {
  const res = await strapi.findOne('players', victimid, {
    populate: { revivesBy: { fields: ['id'] } }
  });
  const revives = res.data.attributes.revivesBy.data.map((rev) => rev.id);
  revives.push(reviveId);
  await strapi.update('players', victimid, {
    revivesBy: revives
  });
  await updatePlayerScore(strapi, victimid);
}

export async function addReviveToTeam(strapi, reviveId, teamId, isLive) {
  const res = await strapi.findOne('teams', teamId, {
    fields: ['reviveCount'],
    populate: { revives: { fields: ['id'] } }
  });
  const reviveCount = parseInt(res.data.attributes.reviveCount);
  const revives = res.data.attributes.revives.data.map((rev) => rev.id);
  revives.push(reviveId);
  await strapi.update('teams', teamId, {
    revives: revives,
    reviveCount: isLive ? reviveCount + 1 : reviveCount
  });
  if (isLive) {
    await updateTeamScore(strapi, teamId);
  }
}

export async function addReviveToSquad(strapi, reviveId, squadId, isLive) {
  const res = await strapi.findOne('squads', squadId, {
    fields: ['reviveCount'],
    populate: { revives: { fields: ['id'] } }
  });
  const reviveCount = parseInt(res.data.attributes.reviveCount);
  const revives = res.data.attributes.revives.data.map((rev) => rev.id);
  revives.push(reviveId);
  await strapi.update('squads', squadId, {
    revives: revives,
    reviveCount: isLive ? reviveCount + 1 : reviveCount
  });
  if (isLive) {
    await updateSquadScore(strapi, squadId);
  }
}

export async function updatePlayerGuildTag(strapi, playerId, name) {
  const res = await strapi.findOne('players', playerId, {
    fields: ['suffix']
  });
  const guildTag = name.split(res.data.attributes.suffix)[0];
  if (guildTag !== name) {
    await strapi.update('players', playerId, {
      guildTag: guildTag,
      name: guildTag + res.data.attributes.suffix
    });
  }
}

export async function updatePlayerScore(strapi, playerId) {
  const res = await strapi.findOne('players', playerId, {
    fields: ['killCount', 'deathCount', 'incapCount', 'incapVictimCount', 'revivedCount']
  });
  const killCount = res.data.attributes.killCount;
  const deathCount = res.data.attributes.deathCount;
  const incapCount = res.data.attributes.incapCount;
  const incapVictimCount = res.data.attributes.incapVictimCount;
  await strapi.update('players', playerId, {
    globalKdr: deathCount !== 0 ? killCount / deathCount : 0,
    globalIdr: deathCount !== 0 ? incapCount / deathCount : 0,
    globalKir: incapVictimCount !== 0 ? killCount / incapVictimCount : 0,
    globalIir: incapVictimCount !== 0 ? incapCount / incapVictimCount : 0
  });
}

export async function updateSquadScore(strapi, squadId) {
  const res = await strapi.findOne('squads', squadId, {
    fields: ['killCount', 'deathCount', 'incapCount', 'incapVictimCount']
  });
  const killCount = res.data.attributes.killCount;
  const deathCount = res.data.attributes.deathCount;
  const incapCount = res.data.attributes.incapCount;
  const incapVictimCount = res.data.attributes.incapVictimCount;
  const reviveCount = res.data.attributes.reviveCount;
  await strapi.update('squads', squadId, {
    kdr: deathCount !== 0 ? killCount / deathCount : 0,
    idr: deathCount !== 0 ? incapCount / deathCount : 0,
    kir: incapVictimCount !== 0 ? killCount / incapVictimCount : 0,
    iir: incapVictimCount !== 0 ? incapCount / incapVictimCount : 0,
    rir: incapVictimCount !== 0 ? reviveCount / incapVictimCount : 0,
    revivedCount: incapVictimCount - deathCount
  });
}

export async function updateTeamScore(strapi, teamId) {
  const res = await strapi.findOne('teams', teamId, {
    fields: ['killCount', 'deathCount', 'incapCount', 'incapVictimCount', 'reviveCount']
  });
  const killCount = res.data.attributes.killCount;
  const deathCount = res.data.attributes.deathCount;
  const incapCount = res.data.attributes.incapCount;
  const incapVictimCount = res.data.attributes.incapVictimCount;
  const reviveCount = res.data.attributes.reviveCount;
  await strapi.update('teams', teamId, {
    kdr: deathCount !== 0 ? killCount / deathCount : 0,
    idr: deathCount !== 0 ? incapCount / deathCount : 0,
    kir: incapVictimCount !== 0 ? killCount / incapVictimCount : 0,
    iir: incapVictimCount !== 0 ? incapCount / incapVictimCount : 0,
    rir: incapVictimCount !== 0 ? reviveCount / incapVictimCount : 0
  });
}
