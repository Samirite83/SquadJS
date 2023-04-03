import {
  getTeamByMatch,
  setPlayerCurrentTeam,
  getPlayerIdBySteamId,
  getLayerinfoIdByClassname,
  getLastMatch,
  Match,
  createMatchInDB,
  createNewTeams,
  addMatchToServer,
  addMatchToPlayer,
  addTeamsToMatch,
  addLayerToMatch,
  getTeamById,
  createNewSquad,
  addSquadToCreator,
  addSquadToTeam,
  setVictimLastAttacker,
  getSquadBySquadId,
  getVictimLastAttacker,
  getPlayerCurrentSquad,
  setPlayerCurrentSquad,
  addIncapToVictim,
  updateTeamIncapVictimCount,
  updateSquadIncapVictimCount,
  setAttackerLastWeapon,
  addIncapToAttacker,
  updateTeamIncapCount,
  updateSquadIncapCount,
  addDeathToVictim,
  addDeathToTeam,
  addKillToAttacker,
  addKillToTeam,
  addKillToSquad,
  addDeathToSquad,
  addReviveToReviver,
  addReviveToVictim,
  addReviveToTeam,
  addReviveToSquad,
  removePlayerFromSquad,
  updateLayerInfo,
  updatePlayerGuildTag
} from '../utils/zgeg-utils.js';
import BasePlugin from './base-plugin.js';

export default class ZgegLog extends BasePlugin {
  static get description() {
    return 'Description ';
  }

  static get defaultEnabled() {
    return false;
  }

  static get optionsSpecification() {
    return {
      strapi: {
        required: true,
        connector: 'strapi',
        description: 'The strapi connector to store into CMS database.',
        default: 'strapi'
      },
      liveThreshold: {
        required: false,
        description: 'Player count required for "Live" status to start update players stats',
        default: 50
      },
      notLiveCount: {
        required: false,
        description: 'If true, stats will also update on seed / when not live',
        default: false
      },
      seedMap: {
        required: false,
        description: 'Seeding map',
        default: 'Sumari_Seed_v2'
      }
    };
  }

  constructor(server, options, connectors) {
    super(server, options, connectors);

    this.strapi = connectors.strapi;

    this.onTickRate = this.onTickRate.bind(this);
    this.onUpdatedA2SInformation = this.onUpdatedA2SInformation.bind(this);
    this.onNewGame = this.onNewGame.bind(this);
    this.onPlayerWounded = this.onPlayerWounded.bind(this);
    this.onPlayerDied = this.onPlayerDied.bind(this);
    this.onPlayerRevived = this.onPlayerRevived.bind(this);
    this.onRoundEnded = this.onRoundEnded.bind(this);
    this.onSquadCreated = this.onSquadCreated.bind(this);
    this.onPlayerConnected = this.onPlayerConnected.bind(this);
    this.onPlayerDisconnected = this.onPlayerDisconnected.bind(this);
    this.onLayerUpdate = this.onLayerUpdate.bind(this);
    this.onDamage = this.onDamage.bind(this);
    this.onPlayerTeamChange = this.onPlayerTeamChange.bind(this);
    this.onPlayerSquadChange = this.onPlayerSquadChange.bind(this);
  }

  async prepareToMount() {}

  async mount() {
    // Update server name
    await this.strapi.update('servers', this.server.id, {
      name: this.server.serverName
    });

    // Get last match not ended
    this.match = await getLastMatch(this.strapi);

    if (!this.match || this.match.endTime) {
      await this.onNewGame({
        layerClassname: this.server.currentLayer.classname
      });
    } else {
      if (this.server.currentLayer.classname !== this.match.layerName) {
        await this.strapi.update('matches', this.match.id, {
          isDraw: true,
          isFinished: true,
          endTime: new Date(Date.now())
        });
        await this.onNewGame({
          layerClassname: this.server.currentLayer.classname
        });
      } else {
        this.team1 = await getTeamById(this.strapi, this.match.teams[0]);
        this.team2 = await getTeamById(this.strapi, this.match.teams[1]);
      }
    }

    this.isLive = !this.options.notLiveCount
      ? !this.server.currentLayer.classname.includes('Seed')
      : true;
    this.trackSquads = true;

    this.server.on('TICK_RATE', this.onTickRate);
    this.server.on('UPDATED_A2S_INFORMATION', this.onUpdatedA2SInformation);
    this.server.on('NEW_GAME', this.onNewGame);
    this.server.on('PLAYER_WOUNDED', this.onPlayerWounded);
    this.server.on('PLAYER_DIED', this.onPlayerDied);
    this.server.on('PLAYER_REVIVED', this.onPlayerRevived);
    this.server.on('ROUND_ENDED', this.onRoundEnded);
    this.server.on('SQUAD_CREATED', this.onSquadCreated);
    this.server.on('GO_LIVE', this.onLive);
    this.server.on('PLAYER_CONNECTED', this.onPlayerConnected);
    this.server.on('PLAYER_DISCONNECTED', this.onPlayerDisconnected);
    this.server.on('UPDATED_LAYER_INFORMATION', this.onLayerUpdate);
    this.server.on('PLAYER_DAMAGED', this.onDamage);
    this.server.on('PLAYER_TEAM_CHANGE', this.onPlayerTeamChange);
    this.server.on('PLAYER_SQUAD_CHANGE', this.onPlayerSquadChange);
  }

  async unmount() {
    this.server.removeEventListener('TICK_RATE', this.onTickRate);
    this.server.removeEventListener('UPDATED_A2S_INFORMATION', this.onTickRate);
    this.server.removeEventListener('NEW_GAME', this.onNewGame);
    this.server.removeEventListener('PLAYER_WOUNDED', this.onPlayerWounded);
    this.server.removeEventListener('PLAYER_DIED', this.onPlayerDied);
    this.server.removeEventListener('PLAYER_REVIVED', this.onPlayerRevived);
    this.server.removeEventListener('ROUND_ENDED', this.onRoundEnded);
    this.server.removeEventListener('SQUAD_CREATED', this.onSquadCreated);
    this.server.removeEventListener('GO_LIVE', this.onLive);
    this.server.removeEventListener('PLAYER_CONNECTED', this.onPlayerConnected);
    this.server.removeEventListener('PLAYER_DISCONNECTED', this.onPlayerDisconnected);
    this.server.removeEventListener('PLAYER_TEAM_CHANGE', this.onPlayerTeamChange);
    this.server.removeEventListener('PLAYER_SQUAD_CHANGE', this.onPlayerSquadChange);
  }

  async onPlayerConnected(info) {
    if (info.player.steamID) {
      const _playerId = await getPlayerIdBySteamId(this.strapi, info.player.steamID, info);
      const _team = parseInt(info.player.teamID) === 1 ? this.team1 : this.team2;

      this.strapi.update('players', _playerId, {
        suffix: info.player.suffix,
        isPlaying: true
      });

      // Add match to player
      await addMatchToPlayer(this.strapi, _playerId, this.match.id);

      // ser player current team
      await setPlayerCurrentTeam(this.strapi, _playerId, _team.id);
    }
  }

  async onPlayerDisconnected(info) {
    if (info.player) {
      const _player = await getPlayerIdBySteamId(this.strapi, info.player.steamID, info);
      await this.strapi.update('players', _player, {
        isPlaying: false,
        lastWeapon: '',
        lastAttacker: null,
        currentSquad: null,
        currentTeam: null
      });
      if (this.trackSquads) {
        const _oldSquadId = await getPlayerCurrentSquad(this.strapi, _player);
        if (_oldSquadId) {
          await removePlayerFromSquad(this.strapi, _player, _oldSquadId);
        }
      }
    }
  }

  async onPlayerSquadChange(info) {
    const _playerId = await getPlayerIdBySteamId(this.strapi, info.player.steamID, info);
    const _team = await getTeamByMatch(this.strapi, info.player.teamID, this.match);
    const _squadId = await getSquadBySquadId(this.strapi, info.newSquadID, _team, this.match);
    const _oldSquadId = await getPlayerCurrentSquad(this.strapi, _playerId);
    if (_oldSquadId) {
      await removePlayerFromSquad(this.strapi, _playerId, _oldSquadId);
    }
    await setPlayerCurrentTeam(this.strapi, _playerId, _team.id);
    await setPlayerCurrentSquad(this.strapi, _playerId, _squadId);
  }

  async onPlayerTeamChange(info) {
    const _playerId = await getPlayerIdBySteamId(this.strapi, info.player.steamID, info);
    const _team = await getTeamByMatch(this.strapi, info.newTeamID, this.match);
    const _squadId = await getSquadBySquadId(this.strapi, info.player.squadID, _team, this.match);
    const _oldSquadId = await getPlayerCurrentSquad(this.strapi, _playerId);
    if (_oldSquadId) {
      await removePlayerFromSquad(this.strapi, _playerId, _oldSquadId);
    }
    await setPlayerCurrentTeam(this.strapi, _playerId, _team.id);
    await setPlayerCurrentSquad(this.strapi, _playerId, _squadId);
  }

  async onTickRate(info) {
    await this.strapi.update('servers', this.server.id, {
      tickrate: info.tickRate
    });
  }

  async onLayerUpdate() {
    await updateLayerInfo(
      this.strapi,
      this.server.currentLayer.name,
      this.server.currentLayer.map.name,
      this.server.currentLayer.gamemode,
      this.server.currentLayer.numberOfCapturePoints,
      this.server.currentLayer.classname
    );
    // update players guildTag
    for (const _id of Object.keys(this.server.players)) {
      const _player = await getPlayerIdBySteamId(
        this.strapi,
        this.server.players[_id].steamID,
        null
      );
      await updatePlayerGuildTag(this.strapi, _player, this.server.players[_id].name);
    }
  }

  async onUpdatedA2SInformation(info) {
    // update server info
    await this.strapi.update('servers', this.server.id, {
      serverName: this.server.serverName,
      playerCount: this.server.players.length,
      maxPlayers: this.server.maxPlayers,
      publicSlots: this.server.publicSlots,
      publicQueue: this.server.publicQueue,
      reserveSlots: this.server.reserveSlots,
      reserveQueue: this.server.reserveQueue,
      gameVersion: this.server.gameVersion
    });
    if (this.server.players.length < this.options.liveThreshold) {
      await this.server.rcon.setNextLayer(this.options.seedMap);
    }
    if (this.isLive && this.server.players.length === 0) {
      this.isLive = !!this.options.notLiveCount;
      if (this.server.currentLayer.classname !== this.options.seedMap) {
        await this.server.rcon.endMatch();
      }
    }
  }

  async onLive() {
    this.isLive = true;
    this.server.rcon.broadcast('Les stats comptes ! GO KDA bande de ZGEG');
  }

  async onNewGame(info) {
    this.trackSquads = true;
    this.isLive = !this.options.notLiveCount ? !info.layerClassname.includes('Seed') : true;

    const layerId = await getLayerinfoIdByClassname(this.strapi, info.layerClassname);

    this.match = new Match(
      null,
      new Date(Date.now()),
      null,
      this.server.matchTimeout,
      false,
      false,
      this.isLive,
      layerId,
      null,
      info.layerClassname
    );
    await createMatchInDB(this.strapi, this.match);

    [this.team1, this.team2] = await createNewTeams(
      this.strapi,
      this.match,
      this.server.currentLayer
    );

    // add match to server
    await addMatchToServer(this.strapi, this.server.id, this.match);

    // add teams to match
    await addTeamsToMatch(this.strapi, this.team1.id, this.team2.id, this.match);
    // add layer to match
    await addLayerToMatch(this.strapi, layerId, this.match.id);

    // link players to match
    if (this.server.players) {
      for (const _id of Object.keys(this.server.players)) {
        const _player = await getPlayerIdBySteamId(
          this.strapi,
          this.server.players[_id].steamID,
          info
        );
        await addMatchToPlayer(this.strapi, _player, this.match.id);
        await setPlayerCurrentTeam(
          this.strapi,
          _player,
          parseInt(this.server.players[_id].teamID) === 1 ? this.team1.id : this.team2.id
        );
      }
    }
  }

  async onSquadCreated(info) {
    const _locked = String(info.player.squad.locked).toLowerCase() === 'true';
    const _creatorId = await getPlayerIdBySteamId(this.strapi, info.player.steamID, info);
    const _team = await getTeamByMatch(this.strapi, info.player.teamID, this.match);

    // create new squad
    const _squadId = await createNewSquad(
      this.strapi,
      info.squadID,
      info.squadName,
      _locked,
      _team.id,
      this.match.id,
      _creatorId,
      _creatorId
    );

    // link squad with squad creator
    await addSquadToCreator(this.strapi, _creatorId, _squadId);

    // link squads with Team
    await addSquadToTeam(this.strapi, _squadId, _team.id);

    // remove player from previous squad
    const _oldSquadId = await getPlayerCurrentSquad(this.strapi, _creatorId);
    if (_oldSquadId) {
      await removePlayerFromSquad(this.strapi, _creatorId, _oldSquadId);
    }

    // set creator current squad
    await setPlayerCurrentSquad(this.strapi, _creatorId, _squadId);
  }

  async onDamage(info) {
    let _attacker = null;
    let _victim = null;
    if (!info.attacker && !info.victim) return;

    if (info.attacker && info.victim) {
      _attacker = await getPlayerIdBySteamId(this.strapi, info.attacker.steamID, null);
      _victim = await getPlayerIdBySteamId(this.strapi, info.victim.steamID, null);
    }
    // "auto-damage" with vehicule like AA on close rock
    if (info.attacker && !info.victim) {
      _attacker = await getPlayerIdBySteamId(this.strapi, info.attacker.steamID, null);
      _victim = _attacker;
    }

    // Other damages like chopper chopping the victim
    if (!info.attacker && info.victim) {
      _victim = await getPlayerIdBySteamId(this.strapi, info.victim.steamID, null);
    }

    await setVictimLastAttacker(this.strapi, _victim, _attacker);
  }

  async onPlayerWounded(info) {
    let _attackerId = null;
    let _attackerTeam = null;
    let _attackerSquadId = null;
    let _victimId = null;
    let _victimTeam = null;
    let _victimSquadId = null;
    let _isSuicide = false;
    let _isTeamKill = false;

    if (!info.attacker && !info.victim) return;
    if (info.attacker) {
      _attackerId = await getPlayerIdBySteamId(this.strapi, info.attacker.steamID, null);
      _attackerTeam = await getTeamByMatch(this.strapi, info.attacker.teamID, this.match);
      _attackerSquadId = await getSquadBySquadId(
        this.strapi,
        info.attacker.squadID,
        _attackerTeam,
        this.match
      );
      _victimId = info.victim
        ? await getPlayerIdBySteamId(this.strapi, info.victim.steamID, null)
        : _attackerId;
      _victimTeam = info.victim
        ? await getTeamByMatch(this.strapi, info.victim.teamID, this.match)
        : _attackerTeam;
      _victimSquadId = info.victim
        ? await getSquadBySquadId(this.strapi, info.victim.squadID, _victimTeam, this.match)
        : _attackerSquadId;

      if (_victimId === _attackerId) {
        _isTeamKill = false;
        _isSuicide = true;
      } else {
        if (info.attacker.teamID === info.victim.teamID) {
          _isTeamKill = true;
          _isSuicide = false;
        } else {
          _isTeamKill = false;
          _isSuicide = false;
        }
      }
    } else {
      _victimId = await getPlayerIdBySteamId(this.strapi, info.victim.steamID, null);
      _victimTeam = await getTeamByMatch(this.strapi, info.victim.teamID, this.match);
      _victimSquadId = await getSquadBySquadId(
        this.strapi,
        info.victim.squadID,
        _victimTeam,
        this.match
      );

      _attackerId = await getVictimLastAttacker(this.strapi, _victimId);
      if (!_attackerId) {
        _isTeamKill = false;
        _isSuicide = false;
      } else {
        if (_victimId === _attackerId) {
          _isTeamKill = false;
          _isSuicide = true;
          _attackerTeam = _victimTeam;
          _attackerSquadId = _victimSquadId;
        } else {
          _attackerTeam = await getTeamByMatch(
            this.strapi,
            parseInt(_victimTeam.teamID) === 1 ? 2 : 1,
            this.match
          );
          _attackerSquadId = await getPlayerCurrentSquad(this.strapi, _attackerId);
          if (_attackerTeam.id === _victimTeam.id) {
            _isTeamKill = true;
            _isSuicide = false;
          } else {
            _isTeamKill = false;
            _isSuicide = false;
          }
        }
      }
    }
    // Update score
    const res = await this.strapi.create(
      'incaps',
      {
        weapon: info.weapon,
        damage: info.damage,
        isTeamkill: _isTeamKill,
        attacker: _attackerId,
        victim: _victimId,
        time: new Date(Date.now()),
        squad: _attackerSquadId,
        team: _attackerTeam,
        match: this.match.id,
        isLive: this.isLive,
        isSuicide: _isSuicide
      },
      { fields: ['id'] }
    );
    const incap = res.data.id;

    await addIncapToVictim(this.strapi, incap, _victimId, this.isLive);
    await updateTeamIncapVictimCount(this.strapi, _victimTeam.id, this.isLive);
    if (_victimSquadId) {
      await updateSquadIncapVictimCount(this.strapi, _victimSquadId, this.isLive);
    }
    if (_attackerId) {
      await setVictimLastAttacker(this.strapi, _victimId, _attackerId);
      await setAttackerLastWeapon(this.strapi, info.weapon, _attackerId);
      if (!_isTeamKill && !_isSuicide) {
        await addIncapToAttacker(this.strapi, incap, _attackerId, this.isLive);
        await updateTeamIncapCount(this.strapi, _attackerTeam.id, this.isLive);
        if (_attackerSquadId) {
          await updateSquadIncapCount(this.strapi, _attackerSquadId, this.isLive);
        }
      }
    }
  }

  async onPlayerDied(info) {
    let _attackerId = null;
    let _attackerTeam = null;
    let _attackerSquadId = null;
    let _victimId = null;
    let _victimTeam = null;
    let _victimSquadId = null;
    let _isSuicide = false;
    let _isTeamKill = false;

    if (!info.attacker && !info.victim) return;
    if (info.attacker) {
      _attackerId = await getPlayerIdBySteamId(this.strapi, info.attacker.steamID, null);
      _attackerTeam = await getTeamByMatch(this.strapi, info.attacker.teamID, this.match);
      _attackerSquadId = await getSquadBySquadId(
        this.strapi,
        info.attacker.squadID,
        _attackerTeam,
        this.match
      );
      _victimId = info.victim
        ? await getPlayerIdBySteamId(this.strapi, info.victim.steamID, null)
        : _attackerId;
      _victimTeam = info.victim
        ? await getTeamByMatch(this.strapi, info.victim.teamID, this.match)
        : _attackerTeam;
      _victimSquadId = info.victim
        ? await getSquadBySquadId(this.strapi, info.victim.squadID, _victimTeam, this.match)
        : _attackerSquadId;

      if (_victimId === _attackerId) {
        _isTeamKill = false;
        _isSuicide = true;
      } else {
        if (info.attacker.teamID === info.victim.teamID) {
          _isTeamKill = true;
          _isSuicide = false;
        } else {
          _isTeamKill = false;
          _isSuicide = false;
        }
      }
    } else {
      _victimId = await getPlayerIdBySteamId(this.strapi, info.victim.steamID, null);
      _victimTeam = await getTeamByMatch(this.strapi, info.victim.teamID, this.match);
      _victimSquadId = await getSquadBySquadId(
        this.strapi,
        info.victim.squadID,
        _victimTeam,
        this.match
      );

      _attackerId = await getVictimLastAttacker(this.strapi, _victimId);
      if (!_attackerId) {
        _isTeamKill = false;
        _isSuicide = false;
      } else {
        if (_victimId === _attackerId) {
          _isTeamKill = false;
          _isSuicide = true;
          _attackerTeam = _victimTeam;
          _attackerSquadId = _victimSquadId;
        } else {
          _attackerTeam = await getTeamByMatch(
            this.strapi,
            parseInt(_victimTeam.teamID) === 1 ? 2 : 1,
            this.match
          );
          _attackerSquadId = await getPlayerCurrentSquad(this.strapi, _attackerId);
          if (_attackerTeam.id === _victimTeam.id) {
            _isTeamKill = true;
            _isSuicide = false;
          } else {
            _isTeamKill = false;
            _isSuicide = false;
          }
        }
      }
    }
    // Update score
    const res = await this.strapi.create(
      'kills',
      {
        weapon: info.weapon,
        damage: info.damage,
        isTeamkill: _isTeamKill,
        attacker: _attackerId,
        victim: _victimId,
        time: new Date(Date.now()),
        squad: _attackerSquadId,
        team: _attackerTeam,
        match: this.match.id,
        isLive: this.isLive,
        isSuicide: _isSuicide
      },
      { fields: ['id'] }
    );
    if (_isSuicide) {
      const req = await this.strapi.findOne('players', _victimId, {
        fields: ['name']
      });
      this.server.rcon.broadcast(
        `${req.data.attributes.name} s'est suicidé ce gros noob, !votekick`
      );
    }
    const kill = res.data.id;

    await addDeathToVictim(this.strapi, kill, _victimId, this.isLive);
    await addDeathToTeam(this.strapi, kill, _victimTeam.id, this.isLive);
    if (_victimSquadId) {
      await addDeathToSquad(this.strapi, kill, _victimSquadId, this.isLive);
    }
    if (_attackerId) {
      if (!_isTeamKill && !_isSuicide) {
        await addKillToAttacker(this.strapi, kill, _attackerId, this.isLive);
        await addKillToTeam(this.strapi, kill, _attackerTeam.id, this.isLive);
        if (_attackerSquadId) {
          await addKillToSquad(this.strapi, kill, _attackerSquadId, this.isLive);
        }
      }
    }
  }

  async onPlayerRevived(info) {
    const _victimId = await getPlayerIdBySteamId(this.models, info.victim.steamID, null);
    const _reviverId = await getPlayerIdBySteamId(this.models, info.reviver.steamID, null);

    const _reviverTeam = await getTeamByMatch(this.strapi, info.reviver.teamID, this.match);
    const _reviverSquadId = info.reviver.squadID
      ? await getSquadBySquadId(this.strapi, info.reviver.squadID, _reviverTeam, this.match)
      : null;

    // create revivce
    const res = await this.strapi.create('revives', {
      time: new Date(Date.now()),
      victim: _victimId,
      reviver: _reviverId,
      match: this.match.id,
      team: _reviverTeam.id,
      squad: _reviverSquadId,
      isLive: this.isLive
    });

    await addReviveToReviver(this.strapi, res.data.id, _reviverId, this.isLive);

    await addReviveToVictim(this.strapi, res.data.id, _victimId);

    await addReviveToTeam(this.strapi, res.data.id, _reviverTeam.id, this.isLive);

    if (_reviverSquadId) {
      await addReviveToSquad(this.strapi, res.data.id, _reviverSquadId, this.isLive);
    }
  }

  async onRoundEnded(info) {
    let _isDraw = false;
    this.trackSquads = false;

    if (!info.winner || !info.loser) {
      _isDraw = true;
    }

    // update match
    await this.strapi.update('matches', this.match.id, {
      endTime: new Date(Date.now()),
      isFinished: true,
      isDraw: _isDraw
    });

    // Update Teams info
    if (info.winner && info.loser) {
      await this.strapi.update('teams', this.team1.id, {
        hasWon: parseInt(info.winner.team) === parseInt(this.team1.teamID),
        endTickets:
          parseInt(info.winner.team) === parseInt(this.team1.teamID)
            ? info.winner.tickets
            : info.loser.tickets,
        teamFaction:
          parseInt(info.winner.team) === parseInt(this.team1.teamID)
            ? info.winner.faction
            : info.loser.faction,
        teamName:
          parseInt(info.winner.team) === parseInt(this.team1.teamID)
            ? info.winner.subfaction
            : info.loser.subfaction
      });
      await this.strapi.update('teams', this.team2.id, {
        hasWon: parseInt(info.winner.team) === parseInt(this.team2.teamID),
        endTickets:
          parseInt(info.winner.team) === parseInt(this.team2.teamID)
            ? info.winner.tickets
            : info.loser.tickets,
        teamFaction:
          parseInt(info.winner.team) === parseInt(this.team2.teamID)
            ? info.winner.faction
            : info.loser.faction,
        teamName:
          parseInt(info.winner.team) === parseInt(this.team2.teamID)
            ? info.winner.subfaction
            : info.loser.subfaction
      });
    }
    if (this.server.players) {
      for (const _id of Object.keys(this.server.players)) {
        const _player = await getPlayerIdBySteamId(
          this.strapi,
          this.server.players[_id].steamID,
          info
        );
        await setPlayerCurrentTeam(this.strapi, _player, null);
        await setPlayerCurrentSquad(this.strapi, _player, null);
      }
    }
  }
}
