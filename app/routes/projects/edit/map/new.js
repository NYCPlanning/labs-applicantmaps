import Route from '@ember/routing/route';
import normalizeCartoVectors from 'cartobox-promises-utility/utils/normalize-carto-vectors';
import { hash } from 'rsvp';

export default class ProjectsNewRoute extends Route {
  model = async function() {
    const sources = await this.store.findAll('source')
      .then(sourceModels => normalizeCartoVectors(sourceModels.toArray()));
    const layerGroups =
      await this.store.findAll('layer-group');
    const layers =
      await this.store.peekAll('layer');

    const project = this.modelFor('projects.edit');

    return hash({
      sources,
      layers,
      layerGroups,
      project,
      applicantMap: this.store.createRecord('applicant-map', { project }),
    });
  }

  deactivate() {
    const { applicantMap } = this.modelFor('projects.edit.map.new');
    applicantMap.rollbackAttributes();
  }
}
