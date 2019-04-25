// @ts-ignore
import OverwatchLeague from "overwatchleague";
import fs from "fs";
import {
  prisma,
  TeamCreateInput,
  AccountCreateInput,
  PlayerCreateInput,
  AccountType,
  TeamUpdateManyMutationInput
} from "../prisma-client";

const OWL = new OverwatchLeague();

const fetchOwl = async () => {
  const teams = (await OWL.getTeams()).data.competitors;
  return {
    matches: (await OWL.getMatches()).data.content,
    teams: await Promise.all(
      teams.map(async (team: { [key: string]: any }) => {
        return team.competitor;
      })
    )
  };
};

const getTeamFromPayload = (team: any): TeamCreateInput => {
  return {
    api_id: team.id,
    handle: team.handle,
    name: team.name,
    homeLocation: team.homeLocation,
    primaryColor: team.primaryColor,
    secondaryColor: team.secondaryColor,
    abbreviatedName: team.abbreviatedName,
    addressCountry: team.addressCountry,
    icon: team.icon,
    secondaryPhoto: team.secondaryPhoto,
    owlDivision: team.owl_division,
    players: {
      create: team.players.map((player: any) => getPlayerFromPayload(player))
    },
    accounts: {
      create: team.accounts.map((account: any) =>
        getAccountFromPayload(account)
      )
    }
  };
};

const getPlayerFromPayload = (playerContainer: any): PlayerCreateInput => {
  const player = playerContainer.player;
  return {
    api_id: player.id,
    name: player.name,
    handle: player.handle,
    homeLocation: player.homeLocation,
    familyName: player.familyName,
    givenName: player.givenName,
    nationality: player.nationality,
    photo: player.headshot,
    accounts: {
      create: player.accounts.map((account: any) =>
        getAccountFromPayload(account)
      )
    },
    heroes: { set: player.attributes.heroes },
    role: player.attributes.role
  };
};

const getAccountFromPayload = (account: any): AccountCreateInput => {
  return {
    api_id: account.id,
    value: account.value,
    accountType: account.accountType as AccountType,
    isPublic: account.isPublic
  };
};

const getUpdatedTeamFromTypedTeam = (
  typedTeam: TeamCreateInput
): TeamUpdateManyMutationInput => {
  return {
    api_id: typedTeam.api_id,
    handle: typedTeam.handle,
    name: typedTeam.name,
    homeLocation: typedTeam.homeLocation,
    primaryColor: typedTeam.primaryColor,
    secondaryColor: typedTeam.secondaryColor,
    abbreviatedName: typedTeam.abbreviatedName,
    addressCountry: typedTeam.addressCountry,
    icon: typedTeam.icon,
    secondaryPhoto: typedTeam.secondaryPhoto,
    owlDivision: typedTeam.owlDivision
  };
};

export const updateOwl = async () => {
  console.log("fetching owl");
  const owlInfo = await fetchOwl();
  console.log("Done fetching owl");
  fs.writeFile("result.json", JSON.stringify(owlInfo), err =>
    err ? console.error(err) : console.info("Writing to result.json done")
  );
  const typedTeams: TeamCreateInput[] = owlInfo.teams.map(
    (team: any): TeamCreateInput => {
      return getTeamFromPayload(team);
    }
  );
  console.log(`${typedTeams.length} teams to create`);
  typedTeams.map(async typedTeam => {
    if (await prisma.$exists.team({ api_id: typedTeam.api_id })) {
      console.log("updating team");
      try {
        await prisma.updateManyTeams({
          data: getUpdatedTeamFromTypedTeam(typedTeam),
          where: { api_id: typedTeam.api_id }
        });
      } catch (err) {
        console.error(err);
      }
      console.log(`Team ${typedTeam.name} updated`);
    } else {
      console.log("creating team");
      await prisma.createTeam(typedTeam);
      console.log(`Team ${typedTeam.name} created`);
    }
  });
};
